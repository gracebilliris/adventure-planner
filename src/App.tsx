import { useMemo, useRef, useState } from 'react'
import { DestinationPhoto, PhotoCredit, destinationPhotos } from './DestinationPhoto'
import {
  places, defaultPreferences, generatePlan, evaluatePlan,
  serializePlan, deserializePlan, saveFavorites, loadFavorites,
  type Interest, type Area, type Preferences, type Plan, type Place,
} from './planner'
import './styles.css'

const interestOptions: { value: Interest; label: string; icon: string }[] = [
  { value: 'nature', label: 'Nature', icon: '✳' },
  { value: 'culture', label: 'Culture', icon: '◈' },
  { value: 'food', label: 'Food & drink', icon: '◒' },
  { value: 'views', label: 'Lovely views', icon: '☀' },
]
const areas: Area[] = ['Circular Quay', 'Central', 'Darling Harbour']
const money = (value: number) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(value)
const time = (minutes: number) => minutes >= 60 ? `${Math.floor(minutes / 60)}h${minutes % 60 ? ` ${minutes % 60}m` : ''}` : `${minutes} min`

function initialPlan(): Plan {
  if (typeof window !== 'undefined' && window.location.hash.length > 1) {
    try {
      const restored = deserializePlan(decodeURIComponent(window.location.hash.slice(1)))
      if (restored) return restored
    } catch { /* An incomplete link should not prevent a fresh outing. */ }
  }
  return generatePlan({ ...defaultPreferences, interests: [...defaultPreferences.interests] })
}

export default function App() {
  const [plan, setPlan] = useState<Plan>(initialPlan)
  const [preferences, setPreferences] = useState<Preferences>(() => ({ ...plan.preferences, interests: [...plan.preferences.interests] }))
  const [favorites, setFavorites] = useState<Plan[]>(() => {
    try { return loadFavorites() } catch { return [] }
  })
  const [rememberArea, setRememberArea] = useState(false)
  const [status, setStatus] = useState('Your next little adventure starts here.')
  const [discoveryFilter, setDiscoveryFilter] = useState<Interest | 'all'>('all')
  const [discoveryLimit, setDiscoveryLimit] = useState(6)
  const [shareLink, setShareLink] = useState('')
  const itineraryTitle = useRef<HTMLHeadingElement>(null)
  const result = useMemo(() => evaluatePlan(plan), [plan])
  const selectedPlaces = plan.stops.map(stop => ({ stop, place: places.find(place => place.id === stop.placeId) }))
  const visiblePlaces = places.filter(place => discoveryFilter === 'all' || place.interests.includes(discoveryFilter))
  const directions = useMemo(() => {
    const destinations = selectedPlaces.flatMap(({ place }) => place ? [`${place.lat},${place.lng}`] : [])
    if (!destinations.length) return ''
    const params = new URLSearchParams({
      api: '1', origin: `${plan.preferences.area}, Sydney NSW, Australia`,
      destination: destinations[destinations.length - 1], travelmode: 'walking',
    })
    if (destinations.length > 1) params.set('waypoints', destinations.slice(0, -1).join('|'))
    return `https://www.google.com/maps/dir/?${params}`
  }, [plan, selectedPlaces])

  function updatePreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setPreferences(previous => ({ ...previous, [key]: value }))
  }
  function revealItinerary() {
    window.requestAnimationFrame(() => {
      itineraryTitle.current?.focus({ preventScroll: true })
      itineraryTitle.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
    })
  }
  function generate() {
    const next = generatePlan({ ...preferences, interests: [...preferences.interests] })
    setPlan(next)
    setShareLink('')
    setStatus(next.stops.length ? 'A fresh itinerary is ready. Make it your own below.' : 'No outing fits these preferences. Try more time, a higher budget, or different interests.')
    revealItinerary()
  }
  function editStops(stops: Plan['stops'], message: string) {
    setPlan(previous => ({ ...previous, stops }))
    setShareLink('')
    setStatus(message)
  }
  function addPlace(place: Place) {
    if (plan.stops.length >= 12) {
      setStatus('This afternoon has reached the 12-stop limit. Remove a stop before adding another.')
      return
    }
    editStops([...plan.stops, { placeId: place.id, duration: place.duration }], `${place.name} added. Check your updated time and budget.`)
  }
  function moveStop(index: number, direction: -1 | 1) {
    const stops = [...plan.stops]
    const target = index + direction
    if (target < 0 || target >= stops.length) return
    ;[stops[index], stops[target]] = [stops[target], stops[index]]
    editStops(stops, `${selectedPlaces[index].place?.name ?? 'Stop'} moved ${direction === -1 ? 'up' : 'down'}.`)
  }
  function save() {
    const next = [...favorites.filter(item => item.id !== plan.id), plan]
    try {
      if (!saveFavorites(next, undefined, rememberArea)) {
        setStatus('This browser could not save your plan. You can still download it.')
        return
      }
      setFavorites(loadFavorites())
      setStatus(`Plan saved on this browser.${rememberArea ? ' Starting area included by your choice.' : ' Starting area not stored.'}`)
    } catch { setStatus('Browser storage is unavailable. Download your plan to keep a copy.') }
  }
  function deleteFavorite(id: string) {
    const next = favorites.filter(item => item.id !== id)
    try {
      if (!saveFavorites(next, undefined, rememberArea)) {
        setStatus('Unable to delete from browser storage. Please try again.')
        return
      }
      setFavorites(next)
      setStatus('Saved plan deleted from this browser.')
    } catch { setStatus('Browser storage is unavailable; the saved plan could not be deleted.') }
  }
  function download() {
    try {
      const url = URL.createObjectURL(new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' }))
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'sydney-little-adventure.json'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setStatus('Your itinerary was downloaded as JSON.')
    } catch { setStatus('Download unavailable in this browser. Try sharing the link instead.') }
  }
  async function share() {
    try {
      const url = new URL(window.location.href)
      url.hash = encodeURIComponent(serializePlan(plan))
      const link = url.toString()
      setShareLink(link)
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(link)
          setStatus('Share link copied. Anyone with the link can open this itinerary.')
          return
        } catch { /* The visible link also works when clipboard permission is denied. */ }
      }
      setStatus('Your share link is ready below. Select it and copy it manually.')
    } catch { setStatus('The share link could not be created. Download the plan instead.') }
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#planner">Skip to planner</a>
      <header className="site-header">
        <a className="wordmark" href="#" aria-label="Little Elsewhere home"><span className="brand-symbol">✳</span> little elsewhere<span className="wordmark-dot">.</span></a>
        <nav aria-label="Main navigation"><a href="#planner">Plan a day</a><a href="#discover">The little guide</a><a href="#saved">Saved plans <span className="nav-count">{favorites.length}</span></a></nav>
        <span className="edition">SYDNEY EDITION <span>↗</span></span>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span className="tiny-line" /> LESS SCROLLING. MORE WANDERING.</p>
            <h1 id="hero-title">A little time.<br />A great <em>day out.</em></h1>
            <p className="hero-description">Big harbour energy. Small, lovely adventures. Turn a few free hours into a Sydney outing that feels like you.</p>
            <a className="text-link hero-action" href="#preferences">Plan my afternoon <span aria-hidden="true">↘</span></a>
            <div className="hero-note"><span aria-hidden="true">✳</span> Made for the time you actually have.</div>
          </div>
          <figure className="hero-visual">
            <div className="art-caption"><span>POSTCARD NO. 001</span><span>33.87° S · 151.21° E</span></div>
            <DestinationPhoto placeId="quay-promenade" className="panorama" eager />
            <figcaption className="postcard-footer"><span>Circular Quay promenade<br /><PhotoCredit placeId="quay-promenade" /></span><span className="stamp" aria-hidden="true">SYDNEY<br /><b>↗</b><br />ON FOOT</span></figcaption>
          </figure>
        </section>

        <aside className="trust-strip" aria-label="About this planner">
          <span><span aria-hidden="true">◈</span> A small, handpicked city guide</span>
          <span><span aria-hidden="true">↗</span> Walking time built in</span>
          <span><span aria-hidden="true">♡</span> No account. No location tracking.</span>
        </aside>

        <section className="planner-section" id="planner" aria-labelledby="planner-title">
          <div className="section-heading"><div><p className="eyebrow">01 / MAKE IT YOURS</p><h2 id="planner-title">Your afternoon, <em>your way.</em></h2></div><p>A few details. A little local inspiration.<br />Leave the overthinking to us.</p></div>
          <nav className="planner-jumps" aria-label="Planner sections"><a href="#preferences">1. Set preferences</a><a href="#itinerary">2. Your itinerary</a><a href="#discover">3. Add a stop</a></nav>
          <div className="planner-grid">
            <form className="preferences-panel" id="preferences" aria-label="Plan preferences" onSubmit={event => { event.preventDefault(); generate() }}>
              <div className="panel-title"><span className="small-number">01</span><h3>The essentials</h3></div>
              <div className="field">
                <label htmlFor="available-time">How much time do you have?<span>Including walks between stops</span></label>
                <div className="input-unit"><input id="available-time" type="number" min="15" max="720" step="5" required value={preferences.minutes} onChange={event => updatePreference('minutes', Number(event.target.value))} /><span>minutes</span></div>
                <div className="quick-options" aria-label="Quick time choices">{[60, 120, 180, 240].map(minutes => <button key={minutes} type="button" className={preferences.minutes === minutes ? 'selected' : ''} aria-pressed={preferences.minutes === minutes} onClick={() => updatePreference('minutes', minutes)}>{time(minutes)}</button>)}</div>
              </div>
              <div className="field"><label htmlFor="budget">Your spending limit<span>Estimated admission & food, per person</span></label><div className="input-unit"><span className="currency-prefix">$</span><input id="budget" type="number" min="0" max="1000" required value={preferences.budget} onChange={event => updatePreference('budget', Number(event.target.value))} /><span>AUD</span></div></div>
              <fieldset className="field interests-field"><legend>What sounds like your kind of day?</legend><p className="field-hint">Pick a few favourites, or leave it open.</p><div className="interest-options">{interestOptions.map(option => <label key={option.value} className={`interest-choice ${preferences.interests.includes(option.value) ? 'is-selected' : ''}`}><input type="checkbox" checked={preferences.interests.includes(option.value)} onChange={event => updatePreference('interests', event.target.checked ? [...preferences.interests, option.value] : preferences.interests.filter(value => value !== option.value))} /><span aria-hidden="true">{option.icon}</span>{option.label}<span className="choice-tick" aria-hidden="true">✓</span></label>)}</div></fieldset>
              <div className="field"><label htmlFor="starting-area">Where are you starting?<span>A neighbourhood, not your precise location</span></label><select id="starting-area" value={preferences.area} onChange={event => updatePreference('area', event.target.value as Area)}>{areas.map(area => <option key={area}>{area}</option>)}</select></div>
              <label className="rain-choice"><input type="checkbox" checked={preferences.rainy} onChange={event => updatePreference('rainy', event.target.checked)} /><span><b>Rain on the forecast?</b><small>Indoor-friendly stops only</small></span><span aria-hidden="true">☂</span></label>
              <button className="button button-primary generate-button" type="submit">Generate itinerary <span aria-hidden="true">↗</span></button>
              <p className="form-footnote">Curated suggestions, not a booking. Interests prioritise stops rather than restrict them.</p>
            </form>

            <section className="itinerary-panel" id="itinerary" aria-label="Itinerary">
              <div className="itinerary-heading"><div><p className="eyebrow">YOUR LITTLE ESCAPE</p><h3 ref={itineraryTitle} tabIndex={-1}>{plan.name || 'A Sydney kind of day'}</h3></div><span className="route-badge"><span aria-hidden="true">↗</span> ON FOOT</span></div>
              <a className="text-link itinerary-edit" href="#preferences">Change time, budget or interests ↑</a>
              <div className="status-message" role="status" aria-live="polite" aria-atomic="true"><span aria-hidden="true">✳</span> {status}</div>
              <div className="plan-totals" aria-label="Itinerary totals"><div><strong>{time(result.minutes)}</strong><span>total time</span></div><div><strong>{money(result.cost)}</strong><span>estimated spend</span></div><div><strong>{result.travelMinutes} <small>min</small></strong><span>walking estimate</span></div></div>
              <div className="route-origin"><span aria-hidden="true">◎</span><span>Set off from <b>{plan.preferences.area}</b><small>Time allowance: {time(plan.preferences.minutes)} · Budget: {money(plan.preferences.budget)}</small></span></div>
              {!result.valid && <div className="plan-warning" role="alert"><strong>A little adjustment needed</strong><ul>{result.issues.map((issue, index) => <li key={index}>{issue}</li>)}</ul><p>Your edits are kept. Remove a stop, shorten a visit, or regenerate with different preferences.</p></div>}
              <div className="stops-list">
                {!plan.stops.length && <div className="empty-plan"><span aria-hidden="true">✳</span><h4>A little room for possibility.</h4><p>Generate an itinerary or add a place from the guide below. More time or a bigger budget may open up more options.</p><a className="text-link" href="#discover">Explore the guide ↘</a></div>}
                {selectedPlaces.map(({ stop, place }, index) => <div className="stop-wrapper" key={`${stop.placeId}-${index}`}>
                  <div className="walking-leg"><span aria-hidden="true">⋮</span> {result.legs[index] ?? 0} min estimated walk{index === 0 ? ' to your first stop' : ''}</div>
                  <article className="itinerary-stop" data-testid="itinerary-stop" aria-label={`Stop ${index + 1}: ${place?.name ?? 'Unknown place'}`}>
                    <span className="stop-number">{String(index + 1).padStart(2, '0')}</span>
                    <div className="stop-content">
                      {place && <DestinationPhoto placeId={place.id} className="stop-photo" />}
                      <div className="stop-category">{place?.interests.map(interest => interestOptions.find(option => option.value === interest)?.label).join(' / ') ?? 'Unavailable place'}{place?.rainy && <span> · INDOOR-FRIENDLY</span>}</div><h4>{place?.name ?? 'Unknown place'}</h4><p>{place?.description ?? 'This stop is no longer in our guide. Remove it and choose another.'}</p><div className="stop-details"><span>{place ? place.cost === 0 ? 'Free to explore' : `${money(place.cost)} estimated` : 'Cost unavailable'}</span><span>{place?.area}</span></div><div className="stop-edit-row"><label htmlFor={`duration-${index}`}>Visit <input id={`duration-${index}`} aria-label={`Duration at ${place?.name ?? 'unknown place'} in minutes`} type="number" min="5" max="360" value={stop.duration} onChange={event => editStops(plan.stops.map((entry, stopIndex) => stopIndex === index ? { ...entry, duration: Number(event.target.value) } : entry), 'Visit duration updated. Totals have been recalculated.')} /> min</label><div className="stop-actions"><button type="button" aria-label={`Move ${place?.name ?? 'unknown place'} up`} disabled={index === 0} onClick={() => moveStop(index, -1)}>↑</button><button type="button" aria-label={`Move ${place?.name ?? 'unknown place'} down`} disabled={index === plan.stops.length - 1} onClick={() => moveStop(index, 1)}>↓</button><button className="remove-button" type="button" aria-label={`Remove ${place?.name ?? 'unknown place'}`} onClick={() => editStops(plan.stops.filter((_, stopIndex) => stopIndex !== index), `${place?.name ?? 'Stop'} removed.`)}>Remove</button></div></div></div>
                  </article>
                </div>)}
              </div>
              {directions && <a className="directions-link" href={directions} target="_blank" rel="noopener noreferrer">Open walking directions in Google Maps <span aria-hidden="true">↗</span><small>Opens an external service. No live map or routing API is used here.</small></a>}
              <div className="save-controls"><label className="remember-choice"><input type="checkbox" checked={rememberArea} onChange={event => setRememberArea(event.target.checked)} /><span>Remember my starting area in saved plans <small>Optional. Otherwise, your area is not stored locally.</small></span></label><div className="plan-buttons"><button className="button button-primary" type="button" disabled={!plan.stops.length || !result.valid} onClick={save}>Save plan <span aria-hidden="true">♡</span></button><button className="button button-secondary" type="button" onClick={share}>Share link <span aria-hidden="true">↗</span></button><button className="utility-button" type="button" onClick={download}>Download plan</button><button className="utility-button" type="button" onClick={() => window.print()}>Print</button></div></div>
              {shareLink && <div className="share-result"><label htmlFor="share-link">Your shareable link <span>Contains the itinerary and selected starting area.</span></label><input id="share-link" type="text" readOnly value={shareLink} onFocus={event => event.currentTarget.select()} /><small>Copy this link to share or keep it for later. Nothing is uploaded.</small></div>}
            </section>
          </div>
          <aside className="disclaimer"><strong>A note before you wander.</strong> Curated examples, not verified listings. Planning works offline once loaded; a fresh offline visit is not guaranteed. No accounts, location tracking, or planning APIs. All prices, visit durations and walking times are estimates—not live prices, opening hours, availability or traffic. Check venues, weather and accessibility before heading out. Walking estimates include your first leg but not the return journey; indoor stops do not mean covered walks. Maps opens an external service.</aside>
        </section>

        <section className="discovery-section" id="discover" aria-labelledby="discover-title">
          <div className="section-heading"><div><p className="eyebrow">02 / FOLLOW YOUR CURIOSITY</p><h2 id="discover-title">Good places.<br /><em>Little detours.</em></h2></div><p>A handpicked collection of Sydney favourites.<br />Add a stop. Take the scenic route.</p></div>
          <div className="discovery-filters" aria-label="Filter places by interest"><button type="button" aria-pressed={discoveryFilter === 'all'} className={discoveryFilter === 'all' ? 'active' : ''} onClick={() => { setDiscoveryFilter('all'); setDiscoveryLimit(6) }}>All little discoveries <span>{places.length}</span></button>{interestOptions.map(option => <button key={option.value} type="button" aria-pressed={discoveryFilter === option.value} className={discoveryFilter === option.value ? 'active' : ''} onClick={() => { setDiscoveryFilter(option.value); setDiscoveryLimit(6) }}><span aria-hidden="true">{option.icon}</span> {option.label}</button>)}</div>
          <div className="discovery-grid" id="place-results">{visiblePlaces.slice(0, discoveryLimit).map(place => {
            const added = plan.stops.some(stop => stop.placeId === place.id)
            return <article className="discovery-card" key={place.id}>
              <figure className="destination-photo">
                <div className="card-art"><DestinationPhoto placeId={place.id} /><span className="card-price">{place.cost === 0 ? 'A FREE LITTLE JOY' : `EST. ${money(place.cost)}`}</span></div>
                <figcaption><PhotoCredit placeId={place.id} /></figcaption>
              </figure>
              <div className="card-body"><div className="card-meta"><span>{place.area}</span><span>{place.duration} MIN</span></div><h3>{place.name}</h3><p>{place.description}</p><div className="card-bottom"><span>{place.rainy ? '☂ Indoor-friendly' : '☀ Out in the open'}</span><button type="button" disabled={added} aria-label={added ? `${place.name} already added` : `Add ${place.name} to itinerary`} onClick={() => addPlace(place)}>{added ? 'Added ✓' : 'Add stop + '}</button></div></div>
            </article>
          })}</div>
          <div className="discovery-pagination"><p role="status">Showing {Math.min(discoveryLimit, visiblePlaces.length)} of {visiblePlaces.length} places</p>{discoveryLimit < visiblePlaces.length && <button className="button button-secondary" type="button" aria-controls="place-results" onClick={() => setDiscoveryLimit(limit => limit + 6)}>Show {Math.min(6, visiblePlaces.length - discoveryLimit)} more places</button>}</div>
          <p className="discovery-caption">No sponsored spots. Just a few reasons to step outside your usual.</p>
        </section>

        <section className="saved-section" id="saved" aria-labelledby="saved-title"><div className="section-heading"><div><p className="eyebrow">03 / FOR ANOTHER AFTERNOON</p><h2 id="saved-title">Keep a little <em>inspiration.</em></h2></div><p>Saved only when you choose.<br />On this browser, and nowhere else.</p></div>{favorites.length ? <div className="favorites-grid">{favorites.map(favorite => <article className="favorite-card" key={favorite.id}><span className="favorite-icon" aria-hidden="true">♡</span><div><h3>{favorite.name}</h3><p>{favorite.stops.length} stops · {time(favorite.preferences.minutes)} allowance</p><div className="favorite-buttons"><button className="text-link" type="button" onClick={() => { setPlan(favorite); setPreferences({ ...favorite.preferences, interests: [...favorite.preferences.interests] }); setShareLink(''); setStatus('Saved plan loaded. Review estimates before heading out.'); revealItinerary() }} aria-label={`Load ${favorite.name}`}>Load plan ↗</button><button className="delete-favorite" type="button" onClick={() => deleteFavorite(favorite.id)} aria-label={`Delete ${favorite.name}`}>Delete</button></div></div></article>)}</div> : <div className="saved-empty"><span aria-hidden="true">♡</span><div><h3>Good days are worth keeping.</h3><p>Use “Save plan” on an itinerary to find it here next time. Nothing is saved automatically.</p></div></div>}</section>
        <details className="photo-credits" id="photo-credits">
          <summary>Photo credits &amp; licences · {places.length} locations</summary>
          <p>Real photographs of the featured places, sourced from Wikimedia Commons. Photos are resized, WebP-compressed and cropped to fit; each retains the licence linked below. They are reference photographs, not live views or guarantees of current conditions.</p>
          <ul>{places.map(place => <li key={place.id}><strong>{place.name}</strong><span className="photo-title">{destinationPhotos[place.id].title}</span><PhotoCredit placeId={place.id} /></li>)}</ul>
        </details>
      </main>
      <footer className="site-footer"><a className="wordmark" href="#"><span className="brand-symbol">✳</span> little elsewhere.</a><p>A little local knowledge. A lot of possibility.</p><a className="back-top" href="#photo-credits" onClick={() => { const credits = document.getElementById('photo-credits') as HTMLDetailsElement | null; if (credits) credits.open = true }}>Photo credits</a><a className="back-top" href="#hero-title">Back to the sunshine ↑</a></footer>
    </div>
  )
}
