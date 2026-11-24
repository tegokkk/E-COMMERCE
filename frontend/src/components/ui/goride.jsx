'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  AnimatePresence,
  LazyMotion,
  MotionConfig,
  animate,
  domMax,
  m,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from 'motion/react';
import { cn } from '@/lib/utils';
import {
  ArrowUpRight,
  BatteryFull,
  Bike,
  Car,
  CarFront,
  Check,
  ChevronRight,
  Flag,
  LoaderCircle,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  Phone,
  Share2,
  ShieldCheck,
  Signal,
  Star,
  Wifi,
  X,
} from 'lucide-react';

// ---------- config ----------
/**
 * Every value a designer is likely to tune lives here. Colours are named for their role, so the
 * same markup survives a palette change.
 */
const THEME = {
  // Outside the hero panel, and the paper the city is drawn on
  page: '#F4F0E8',
  panel: '#F8F5EE',
  card: '#FFFFFF',
  ink: '#14161B',
  grey: '#6B6F77',
  line: 'rgba(20, 22, 27, 0.08)',

  // GoRide yellow: the second headline line, the cars, the pin and the route
  accent: '#F6B51E',
  accentSoft: '#FDEFC8',

  // The app's own map, seen only through the phone
  mapBlock: '#ECE6DA',
  mapRoad: '#FFFFFF',
  mapPark: '#D7E4C4',
  mapWater: '#C3D9E4',

  // The paper city on the page: block tones, the river and the parks
  paperBlock: '#EFE8DC',
  paperWater: '#DCE5E9',
  paperPark: '#E1E6D3',
};

const EMPTY_LINK = { label: '', href: '#' };
const EMPTY_CTA = { label: '', hover: '', href: '#' };

const DEFAULT_CONTENT = {
  brand: { name: '', href: '#' },
  nav: { links: [], signIn: EMPTY_LINK, cta: EMPTY_CTA },
  copy: {
    headline: '',
    phrases: [],
    phraseEvery: 2.8,
    lede: '',
    primary: EMPTY_CTA,
    secondary: EMPTY_LINK,
    stores: [],
    rating: '',
    ratingNote: '',
    stat: { value: '', label: '' },
    riders: [],
  },
  live: { cities: [], every: 3.2 },
  driver: { name: '', initials: '', rating: '', trips: '', plate: '', pin: '' },
  payment: { method: '', note: '' },
  tagline: '',
  reducedMotion: undefined,
};

const GorideContext = createContext(DEFAULT_CONTENT);

const useGoride = () => {
  const {
    brand: BRAND,
    nav: NAV,
    copy: COPY,
    live: LIVE,
    driver: DRIVER,
    payment: PAYMENT,
    tagline: TAGLINE,
    reducedMotion,
  } = useContext(GorideContext);

  return { BRAND, NAV, COPY, LIVE, DRIVER, PAYMENT, TAGLINE, reducedMotion };
};

// An explicit `reducedMotion` prop wins; otherwise the visitor's system setting decides
const useReducedMotionPref = () => {
  const { reducedMotion } = useGoride();
  const system = useMediaQuery('(prefers-reduced-motion: reduce)');

  return reducedMotion ?? system;
};

/**
 * The city plan. Sizes are in px of the hero panel; positions are fractions of it, so the plan fits
 * any screen. `spacing` is one block, `angle` turns the street grid.
 */
const CITY = {
  spacing: 46,
  spacingSmall: 38,
  spacingLarge: 58,
  angle: -12,
  avenueEvery: 4,
  centerY: 0.55,
  roads: ['Market St', 'Broadway', '5th Ave', 'Lake Ave', 'Park Ave', 'Main St', 'Mission St'],
  districts: [
    { name: 'Old Town', x: 0.55, y: 0.26 },
    { name: 'Harbor', x: 0.87, y: 0.2 },
    { name: 'Market Square', x: 0.66, y: 0.56 },
    { name: 'Riverside', x: 0.91, y: 0.66 },
    { name: 'Tech Park', x: 0.5, y: 0.84 },
    { name: 'Airport Road', x: 0.8, y: 0.93 },
  ],
  parks: [
    { x: 0.6, y: 0.4 },
    { x: 0.84, y: 0.82 },
    { x: 0.44, y: 0.62 },
    { x: 0.74, y: 0.12 },
  ],
};

const LENS = {
  zoom: 1.45,
  pinY: 0.43,
};

const CARS = {
  count: 12,
  cruise: 0.9,
  dispatch: 2.4,
  minutesPerBlock: 0.45,
  nearby: 6,
};

const RIDES = [
  { id: 'car', label: 'Standard', price: 1, vehicle: 'White Toyota Camry' },
  { id: 'xl', label: 'XL', price: 1.45, vehicle: 'Black Chevy Suburban' },
  { id: 'bike', label: 'Bike', price: 0.5, vehicle: 'E-bike' },
];

const FARE = {
  base: 4.5,
  perBlock: 0.85,
  minutesPerBlock: 0.6,
};

const CURRENCY = { locale: 'en-US', code: 'USD' };

const BOOKING = {
  search: 1.2,
  pickup: 1.8,
  hold: 3.5,
  press: 0.7,
};

const SPLASH = {
  hold: 1.7,
  shrink: 0.9,
  fade: 0.45,
  skip: '(max-width: 767px)',
};

const INTRO_AT = SPLASH.hold + SPLASH.shrink * 0.6;
const EASE_OUT = [0.22, 1, 0.36, 1];

// ---------- use-media-query ----------
const useMediaQuery = (query) => {
  const subscribe = useCallback(
    (onChange) => {
      const list = window.matchMedia(query);

      list.addEventListener('change', onChange);

      return () => list.removeEventListener('change', onChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
};

// ---------- motion-provider ----------
const MotionProvider = ({ children }) => {
  const { reducedMotion } = useGoride();

  return (
    <LazyMotion features={domMax}>
      <MotionConfig reducedMotion={reducedMotion === undefined ? 'user' : reducedMotion ? 'always' : 'never'}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
};

// ---------- SVG Icons ----------
const GorideAppleIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M16.37 12.6c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.82-.81-3-.79-1.54.02-2.96.9-3.76 2.28-1.6 2.78-.41 6.9 1.15 9.16.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.01-1.12 2.76-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.4-.92-2.42-3.65l.05-.04ZM14.1 5.86c.63-.77 1.06-1.83.94-2.89-.91.04-2.01.6-2.66 1.37-.58.67-1.09 1.75-.96 2.79 1.02.08 2.05-.52 2.68-1.27Z" />
  </svg>
);

const GorideBikeTop = (props) => (
  <svg viewBox="0 0 40 20" fill="none" aria-hidden {...props}>
    <rect x="3" y="7.5" width="33" height="5" rx="2.5" fill="#14161B" />
    <path d="M31 2.5v15" stroke="#14161B" strokeWidth="2.4" strokeLinecap="round" />
    <ellipse cx="18" cy="10" rx="6.5" ry="7.5" fill="#3A3D45" />
    <circle cx="20.5" cy="10" r="4.6" fill="#F6B51E" stroke="#14161B" strokeOpacity="0.3" />
    <rect x="35" y="8.5" width="3" height="3" rx="1" fill="#FFE7A6" />
  </svg>
);

const GorideCarTop = (props) => (
  <svg viewBox="0 0 44 24" fill="none" aria-hidden {...props}>
    <rect x="1" y="2" width="42" height="20" rx="8" fill="#FFFFFF" stroke="#14161B" strokeOpacity="0.2" />
    <path
      d="M28 5.5h4.5c2.6 0 4.5 2.9 4.5 6.5s-1.9 6.5-4.5 6.5H28c.9-2 1.4-4.2 1.4-6.5S28.9 7.5 28 5.5Z"
      fill="#14161B"
    />
    <path
      d="M9.5 6h3.2c-.8 1.8-1.2 3.8-1.2 6s.4 4.2 1.2 6H9.5C8 16.6 7.2 14.4 7.2 12S8 7.4 9.5 6Z"
      fill="#14161B"
      fillOpacity="0.85"
    />
    <rect x="14" y="6.5" width="12" height="11" rx="3" fill="#F2ECE1" />
    <rect x="40" y="4.5" width="2" height="4" rx="1" fill="#F6B51E" />
    <rect x="40" y="15.5" width="2" height="4" rx="1" fill="#F6B51E" />
  </svg>
);

const GorideSuvTop = (props) => (
  <svg viewBox="0 0 50 26" fill="none" aria-hidden {...props}>
    <rect x="1" y="2" width="48" height="22" rx="6" fill="#22252B" stroke="#14161B" strokeOpacity="0.4" />
    <path d="M33 5h5c2.8 0 5 3.6 5 8s-2.2 8-5 8h-5c1-2.3 1.5-5 1.5-8S34 7.3 33 5Z" fill="#5B6270" />
    <path
      d="M8.5 5.5h3c-.8 2.2-1.2 4.8-1.2 7.5s.4 5.3 1.2 7.5h-3C7.3 18.6 6.6 15.9 6.6 13s.7-5.6 1.9-7.5Z"
      fill="#5B6270"
    />
    <rect x="14" y="6" width="17" height="14" rx="2.5" fill="#30343B" />
    <path d="M15 7.5h15M15 18.5h15" stroke="#8A919C" strokeWidth="1" strokeLinecap="round" />
    <rect x="46" y="4.5" width="2" height="4" rx="1" fill="#F6B51E" />
    <rect x="46" y="17.5" width="2" height="4" rx="1" fill="#F6B51E" />
  </svg>
);

// ---------- goride-city-plan ----------
const range = (reach) => Array.from({ length: reach * 2 + 1 }, (_, k) => k - reach);

const tone = (i, j) => {
  const n = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;

  return n - Math.floor(n);
};

const GorideCityPlan = ({
  variant,
  width,
  height,
  spacing,
  angle,
  center,
  reach,
  avenueEvery,
  river,
  parks,
  labels = [],
  roads = [],
  ...props
}) => {
  const id = useId();

  const app = variant === 'app';
  const far = reach * spacing;
  const lines = range(reach);
  const rad = (angle * Math.PI) / 180;
  const gap = spacing * (app ? 0.1 : 0.09);

  const blocks = app
    ? []
    : lines.flatMap((i) =>
        lines
          .map((j) => ({ i, j, shade: tone(i, j) }))
          .filter(({ i: bi, j: bj, shade }) => {
            const cx = center.x + (bi + 0.5) * spacing * Math.cos(rad) - (bj + 0.5) * spacing * Math.sin(rad);
            const cy = center.y + (bi + 0.5) * spacing * Math.sin(rad) + (bj + 0.5) * spacing * Math.cos(rad);

            return shade > 0.28 && cx > -spacing && cx < width + spacing && cy > -spacing && cy < height + spacing;
          })
      );

  const avenues = lines.filter((k) => k % avenueEvery === 0 && Math.abs(k) < reach - 1);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" aria-hidden {...props}>
      <defs>
        <pattern id={id} width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="3.5" cy="3.5" r="0.9" className="fill-(--gr-ink)" fillOpacity="0.16" />
        </pattern>
      </defs>

      {app && <rect width={width} height={height} className="fill-(--gr-mapBlock)" />}

      <g transform={`translate(${center.x} ${center.y}) rotate(${angle})`}>
        {blocks.map((block) => (
          <rect
            key={`${block.i}:${block.j}`}
            x={block.i * spacing + gap}
            y={block.j * spacing + gap}
            width={spacing - gap * 2}
            height={spacing - gap * 2}
            rx="2"
            className="fill-(--gr-paperBlock)"
            fillOpacity={0.35 + block.shade * 0.65}
          />
        ))}

        {parks.map((park) => (
          <g key={`${park.i}:${park.j}`}>
            <rect
              x={park.i * spacing + gap}
              y={park.j * spacing + gap}
              width={spacing * 2 - gap * 2}
              height={spacing - gap * 2}
              rx={app ? spacing * 0.12 : 3}
              className={app ? 'fill-(--gr-mapPark)' : 'fill-(--gr-paperPark)'}
            />
            {!app && (
              <rect
                x={park.i * spacing + gap}
                y={park.j * spacing + gap}
                width={spacing * 2 - gap * 2}
                height={spacing - gap * 2}
                rx="3"
                fill={`url(#${id})`}
              />
            )}
          </g>
        ))}
      </g>

      <path
        d={river}
        strokeWidth={spacing * 0.8}
        strokeLinecap="round"
        className={app ? 'stroke-(--gr-mapWater)' : 'stroke-(--gr-paperWater)'}
      />

      <g transform={`translate(${center.x} ${center.y}) rotate(${angle})`}>
        {lines.map((k) => {
          const avenue = k % avenueEvery === 0;
          const stroke = app ? (avenue ? spacing * 0.32 : spacing * 0.2) : avenue ? spacing * 0.2 : 1;
          const paint = app || avenue ? 'stroke-(--gr-mapRoad)' : 'stroke-(--gr-ink)';
          const opacity = app || avenue ? 1 : 0.07;

          return (
            <g key={k}>
              <line
                x1={k * spacing}
                x2={k * spacing}
                y1={-far}
                y2={far}
                strokeWidth={stroke}
                className={paint}
                strokeOpacity={opacity}
              />
              <line
                x1={-far}
                x2={far}
                y1={k * spacing}
                y2={k * spacing}
                strokeWidth={stroke}
                className={paint}
                strokeOpacity={opacity}
              />
            </g>
          );
        })}

        {!app &&
          roads.length > 0 &&
          avenues.map((k, index) => (
            <g key={`road-${k}`} className="fill-(--gr-ink)" fillOpacity="0.32">
              <text
                x={k * spacing}
                y={(index % 2 ? 1.5 : -2.5) * spacing}
                transform={`rotate(-90 ${k * spacing} ${(index % 2 ? 1.5 : -2.5) * spacing})`}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={spacing * 0.17}
                fontWeight="600"
                letterSpacing="0.18em"
              >
                {roads[index % roads.length].toUpperCase()}
              </text>
              <text
                x={(index % 2 ? -1.5 : 2.5) * spacing}
                y={k * spacing}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={spacing * 0.17}
                fontWeight="600"
                letterSpacing="0.18em"
              >
                {roads[(index + 3) % roads.length].toUpperCase()}
              </text>
            </g>
          ))}
      </g>

      {app &&
        labels.map((label) => (
          <text
            key={label.name}
            x={label.x}
            y={label.y}
            textAnchor="middle"
            className="fill-(--gr-ink) font-semibold"
            fillOpacity="0.5"
            fontSize={spacing * 0.2}
            letterSpacing="0.04em"
          >
            {label.name.toUpperCase()}
          </text>
        ))}
    </svg>
  );
};

// ---------- goride-logo-mark ----------
const GorideLogoMark = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <rect width="24" height="24" rx="7" fill="#F6B51E" />
    <path d="M12 4.8a6.4 6.4 0 0 0-1.6 12.6l3.1 2.4.4-2.6A6.4 6.4 0 0 0 12 4.8Z" fill="#14161B" />
    <circle cx="12" cy="11.2" r="2.3" fill="#F6B51E" />
  </svg>
);

// ---------- goride-play-icon ----------
const GoridePlayIcon = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden {...props}>
    <path d="M4.2 2.6 13.6 12l-9.4 9.4a1.6 1.6 0 0 1-.7-1.35V3.95c0-.56.27-1.06.7-1.35Z" fill="#00d7fe" />
    <path d="m16.8 8.8-3.2 3.2-9.4-9.4c.5-.33 1.17-.38 1.73-.06L16.8 8.8Z" fill="#00f076" />
    <path d="m16.8 15.2-11.07 6.26c-.56.32-1.23.27-1.73-.06l9.6-9.4 3.2 3.2Z" fill="#ff3a44" />
    <path d="m20.5 10.6-3.7-1.8-3.2 3.2 3.2 3.2 3.7-1.8c1.1-.62 1.1-2.18 0-2.8Z" fill="#ffd500" />
  </svg>
);

// ---------- goride-route-layer ----------
const GorideRouteLayer = ({ previewRef, routeRef, scale = 'page', ...props }) => {
  const lens = scale === 'lens';

  return (
    <svg aria-hidden {...props}>
      <path
        ref={previewRef}
        fill="none"
        strokeWidth={lens ? 4 : 3}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={lens ? '1 8' : '1 9'}
        className="stroke-(--gr-ink)"
        strokeOpacity={lens ? 0.55 : 0.7}
      />
      <path
        ref={routeRef}
        fill="none"
        strokeWidth={lens ? 5 : 4}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-(--gr-accent)"
      />
    </svg>
  );
};

// ---------- vehicle-icon ----------
const VehicleIcon = ({ kind, length, className }) => {
  const classes = cn('-translate-x-1/2 -translate-y-1/2', className);

  if (kind === 'xl') return <GorideSuvTop width={length * 1.1} height={length * 0.57} className={classes} />;

  if (kind === 'bike') return <GorideBikeTop width={length * 0.82} height={length * 0.41} className={classes} />;

  return <GorideCarTop width={length} height={length * 0.55} className={classes} />;
};

// ---------- cta-button ----------
const CtaButton = ({ href, label, hoverLabel, size = 'md', className }) => (
  <a href={href} className={cn('gr-cta gr-focus group', size === 'sm' && 'gr-cta-sm', className)}>
    <span aria-hidden className="gr-cta-fill" />
    <span className="gr-cta-labels relative grid overflow-hidden">
      <span className="gr-cta-label gr-cta-label-rest">{label}</span>
      <span aria-hidden className="gr-cta-label gr-cta-label-hover">
        {hoverLabel}
      </span>
    </span>
    <span aria-hidden className="gr-cta-tile">
      <ArrowUpRight className="gr-cta-arrow" strokeWidth={2.4} />
    </span>
  </a>
);

// ---------- city-fleet ----------
const createCity = (width, height, spacing) => {
  const angle = (CITY.angle * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const center = { x: width / 2, y: height * CITY.centerY };
  const reach = Math.ceil(Math.hypot(width, height) / spacing / 2) + 2;

  const toWorld = (i, j) => ({
    x: center.x + i * spacing * cos - j * spacing * sin,
    y: center.y + i * spacing * sin + j * spacing * cos,
  });

  const nearestNode = (x, y) => {
    const dx = x - center.x;
    const dy = y - center.y;

    return {
      i: Math.round((dx * cos + dy * sin) / spacing),
      j: Math.round((-dx * sin + dy * cos) / spacing),
    };
  };

  const inside = (node, margin = spacing) => {
    const p = toWorld(node.i, node.j);

    return p.x > -margin && p.x < width + margin && p.y > -margin && p.y < height + margin;
  };

  const districtAt = (x, y) =>
    CITY.districts.reduce((best, item) =>
      Math.hypot(item.x * width - x, item.y * height - y) < Math.hypot(best.x * width - x, best.y * height - y)
        ? item
        : best
    ).name;

  return { width, height, spacing, angle, center, reach, toWorld, nearestNode, inside, districtAt };
};

const STEPS = [
  { i: 1, j: 0 },
  { i: -1, j: 0 },
  { i: 0, j: 1 },
  { i: 0, j: -1 },
];

const same = (a, b) => a.i === b.i && a.j === b.j;

const walk = (a, b) => {
  const steps = [];
  const cursor = { ...a };

  while (cursor.i !== b.i) {
    cursor.i += Math.sign(b.i - cursor.i);
    steps.push({ ...cursor });
  }

  while (cursor.j !== b.j) {
    cursor.j += Math.sign(b.j - cursor.j);
    steps.push({ ...cursor });
  }

  return steps;
};

const createFleet = (city) => {
  const cars = [];

  const state = {
    assigned: -1,
    target: null,
    left: 0,
    total: 0,
    arrived: false,
  };

  const randomNode = () => {
    for (let k = 0; k < 80; k++) {
      const node = {
        i: Math.floor(Math.random() * city.reach * 2) - city.reach,
        j: Math.floor(Math.random() * city.reach * 2) - city.reach,
      };

      if (city.inside(node, -city.spacing)) return node;
    }

    return { i: 0, j: 0 };
  };

  const roam = (car) => {
    const back = { i: car.from.i - car.to.i, j: car.from.j - car.to.j };

    const options = STEPS.filter((step) => !(step.i === back.i && step.j === back.j))
      .map((step) => ({ i: car.to.i + step.i, j: car.to.j + step.j }))
      .filter((node) => city.inside(node, -city.spacing * 0.5));

    return options.length ? options[Math.floor(Math.random() * options.length)] : { ...car.from };
  };

  for (let k = 0; k < CARS.count; k++) {
    const from = randomNode();
    const step = STEPS[Math.floor(Math.random() * 4)];
    const to = { i: from.i + step.i, j: from.j + step.j };

    cars.push({ kind: RIDES[k % RIDES.length].id, from, to, t: Math.random(), heading: 0, queue: [] });
  }

  const position = (car) => {
    const a = city.toWorld(car.from.i, car.from.j);
    const b = city.toWorld(car.to.i, car.to.j);

    return { x: a.x + (b.x - a.x) * car.t, y: a.y + (b.y - a.y) * car.t };
  };

  const distance = (car, node) => 1 - car.t + Math.abs(node.i - car.to.i) + Math.abs(node.j - car.to.j);

  const nearest = (node, kind) => {
    let best = { index: -1, blocks: Infinity };

    cars.forEach((car, index) => {
      if (kind && car.kind !== kind) return;

      const blocks = distance(car, node);

      if (blocks < best.blocks) best = { index, blocks };
    });

    return best;
  };

  const countNear = (node, blocks) => cars.filter((car) => distance(car, node) <= blocks).length;

  const dispatch = (node, kind) => {
    const { index } = nearest(node, kind);

    if (index < 0) return;

    const car = cars[index];

    car.queue = walk(car.to, node);
    state.assigned = index;
    state.target = node;
    state.left = distance(car, node);
    state.total = state.left;
    state.arrived = false;
  };

  const driveTo = (node) => {
    if (state.assigned < 0) return;

    const car = cars[state.assigned];

    car.queue = walk(car.from, node);
    car.to = car.queue.shift() ?? { ...car.from };
    car.t = 0;
    state.target = node;
    state.arrived = same(car.from, node);
    state.left = distance(car, node);
    state.total = state.left;
  };

  const finish = () => {
    if (state.assigned < 0 || !state.target) return;

    const car = cars[state.assigned];

    car.from = { ...state.target };
    car.to = { ...state.target };
    car.t = 0;
    car.queue = [];
    state.left = 0;
    state.arrived = true;
  };

  const release = () => {
    if (state.assigned >= 0) cars[state.assigned].queue = [];
    state.assigned = -1;
    state.target = null;
    state.left = 0;
    state.total = 0;
    state.arrived = false;
  };

  const route = () => {
    if (state.assigned < 0 || !state.target) return [];

    const car = cars[state.assigned];

    return [position(car), ...[car.to, ...car.queue].map((node) => city.toWorld(node.i, node.j))];
  };

  const step = (dt) => {
    cars.forEach((car, index) => {
      const assigned = index === state.assigned;

      if (assigned && state.arrived) return;

      let move = (assigned ? CARS.dispatch : CARS.cruise) * dt;

      while (move > 0) {
        const remaining = 1 - car.t;

        if (move < remaining) {
          car.t += move;
          move = 0;
        } else {
          move -= remaining;
          car.from = car.to;
          car.t = 0;

          const next = car.queue.shift();

          if (next) {
            car.to = next;
          } else if (assigned) {
            car.to = { ...car.from };
            state.arrived = true;
            move = 0;
          } else {
            car.to = roam(car);
          }
        }
      }

      const a = city.toWorld(car.from.i, car.from.j);
      const b = city.toWorld(car.to.i, car.to.j);

      if (!same(car.from, car.to)) {
        const target = Math.atan2(b.y - a.y, b.x - a.x);
        const turn = Math.atan2(Math.sin(target - car.heading), Math.cos(target - car.heading));

        car.heading += turn * Math.min(1, dt * 10);
      }
    });

    if (state.assigned >= 0 && state.target) {
      state.left = state.arrived ? 0 : distance(cars[state.assigned], state.target);
    }
  };

  return { cars, state, position, nearest, countNear, dispatch, driveTo, finish, release, route, step };
};

// ---------- phone-lens ----------
const ICONS = { car: CarFront, xl: Car, bike: Bike };

const money = new Intl.NumberFormat(CURRENCY.locale, {
  style: 'currency',
  currency: CURRENCY.code,
  minimumFractionDigits: 2,
});

const sheet = {
  initial: { opacity: 0, transform: 'translateY(10px)' },
  animate: { opacity: 1, transform: 'translateY(0px)' },
  exit: { opacity: 0, transform: 'translateY(-8px)' },
  transition: { duration: 0.3, ease: EASE_OUT },
};

const ACTIONS = [
  { label: 'Call', Icon: Phone },
  { label: 'Chat', Icon: MessageCircle },
  { label: 'Share', Icon: Share2 },
  { label: 'Safety', Icon: ShieldCheck },
];

const TripBar = ({ progress, kind, flag }) => {
  const width = useTransform(progress, (value) => `${Math.min(Math.max(value, 0), 1) * 100}%`);

  return (
    <span aria-hidden className="relative mt-3 flex items-center">
      <span className="bg-gr-accent size-2 shrink-0 rounded-full" />
      <span className="bg-gr-ink/10 relative mx-1 h-1 flex-1 rounded-full">
        <m.span style={{ width }} className="bg-gr-accent absolute inset-y-0 left-0 rounded-full" />
        <m.span style={{ left: width }} className="absolute top-1/2">
          <VehicleIcon kind={kind} length={18} className="block max-w-none" />
        </m.span>
      </span>
      {flag ? <Flag className="size-3 shrink-0" /> : <MapPin className="size-3 shrink-0" />}
    </span>
  );
};

const RateDriver = ({ name }) => {
  const [rating, setRating] = useState(0);

  return (
    <div className="gr-rate mt-auto flex w-full items-center justify-between rounded-[11px] px-3 py-2">
      <span className="text-[11px] font-semibold">{rating ? 'Thanks!' : `Rate ${name}`}</span>
      <span className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`${index + 1} star${index ? 's' : ''}`}
            onClick={() => setRating(index + 1)}
            className="gr-focus cursor-pointer rounded-[4px] p-0.5"
          >
            <Star
              aria-hidden
              className={cn(
                'size-4 transition-colors',
                index < rating ? 'fill-gr-accent text-gr-accent' : 'text-gr-ink/25'
              )}
            />
          </button>
        ))}
      </span>
    </div>
  );
};

const holdStill = (event) => event.stopPropagation();

const HoldToBook = ({ label, kind, busy, onBook }) => {
  const runRef = useRef(null);

  const fill = useMotionValue(0);
  const width = useTransform(fill, (value) => `${value * 100}%`);
  const reveal = useTransform(fill, (value) => `inset(0 ${100 - value * 100}% 0 0)`);
  const shown = useTransform(fill, [0, 0.06], [0, 1]);

  const handleStart = (event) => {
    if (busy || event.button !== 0) return;

    runRef.current?.stop();
    runRef.current = animate(fill, 1, {
      duration: BOOKING.press * (1 - fill.get()),
      ease: 'linear',
      onComplete: () => {
        onBook();
        fill.set(0);
      },
    });
  };

  const handleStop = () => {
    if (fill.get() >= 1) return;

    runRef.current?.stop();
    runRef.current = animate(fill, 0, { duration: 0.25, ease: EASE_OUT });
  };

  const handleKey = (event) => {
    if (busy || (event.key !== 'Enter' && event.key !== ' ')) return;

    event.preventDefault();
    onBook();
  };

  return (
    <button
      type="button"
      disabled={busy}
      onPointerDown={handleStart}
      onPointerUp={handleStop}
      onPointerLeave={handleStop}
      onPointerCancel={handleStop}
      onKeyDown={handleKey}
      aria-label={busy ? label : `${label}. Press and hold, or press Enter`}
      className="gr-hold gr-focus relative mt-3 flex h-10 w-full cursor-pointer items-center justify-center overflow-hidden rounded-[11px] text-[13px] font-semibold select-none disabled:cursor-progress"
    >
      <m.span aria-hidden style={{ scaleX: fill }} className="bg-gr-accent absolute inset-0 origin-left" />
      <span className="relative flex items-center gap-2 text-white">
        {busy && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
        {label}
      </span>
      <m.span
        aria-hidden
        style={{ clipPath: reveal }}
        className="text-gr-ink absolute inset-0 flex items-center justify-center gap-2"
      >
        {busy && <LoaderCircle className="size-4 animate-spin" />}
        {label}
      </m.span>
      <m.span aria-hidden style={{ left: width, opacity: shown }} className="absolute top-1/2">
        <VehicleIcon kind={kind} length={22} />
      </m.span>
    </button>
  );
};

const PhoneLens = ({
  city,
  river,
  parks,
  screenRef,
  mapRef,
  routeRef,
  previewRef,
  carRefs,
  district,
  etas,
  nearby,
  minutes,
  trip,
  progress,
  status,
  ride,
  onRide,
  onBook,
}) => {
  const { BRAND, DRIVER, PAYMENT } = useGoride();

  const plan = useMemo(
    () => (
      <GorideCityPlan
        variant="app"
        width={city.width}
        height={city.height}
        spacing={city.spacing}
        angle={CITY.angle}
        center={city.center}
        reach={city.reach}
        avenueEvery={CITY.avenueEvery}
        river={river}
        parks={parks}
        labels={CITY.districts.map((item) => ({ name: item.name, x: item.x * city.width, y: item.y * city.height }))}
      />
    ),
    [city, river, parks]
  );

  const planning = status === 'idle' || status === 'finding';
  const riding = status === 'trip' || status === 'dropped';
  const firstName = DRIVER.name.split(' ')[0];

  const fareFor = (index) => (trip ? money.format(trip.fare * RIDES[index].price) : null);

  const eta = etas[ride] ?? 1;
  const pinChip = planning ? `${eta} min` : status === 'arrived' ? 'Here' : `${minutes} min`;

  return (
    <div className="gr-phone relative">
      <div className="gr-bezel">
        <div ref={screenRef} className="gr-screen relative overflow-hidden">
          <div className="absolute inset-0">
            <div ref={mapRef} className="absolute top-0 left-0 origin-top-left will-change-transform">
              {plan}
            </div>

            <GorideRouteLayer
              previewRef={previewRef}
              routeRef={routeRef}
              scale="lens"
              className="absolute inset-0 size-full overflow-visible"
            />

            {Array.from({ length: CARS.count }, (_, index) => (
              <div
                key={index}
                ref={(el) => {
                  carRefs.current[index] = el;
                }}
                className="absolute top-0 left-0 will-change-transform"
              >
                <VehicleIcon kind={RIDES[index % RIDES.length].id} length={24} className="gr-lens-car" />
              </div>
            ))}

            {!riding && (
              <div className="absolute left-1/2" style={{ top: `${LENS.pinY * 100}%` }}>
                <span className="gr-pin-shadow absolute top-0 left-0 h-[6px] w-[16px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
                <div className="absolute bottom-0 left-0 flex -translate-x-1/2 flex-col items-center">
                  <span className="bg-gr-ink mb-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-white">
                    {pinChip}
                  </span>
                  <span className="bg-gr-accent border-gr-ink grid size-[18px] place-items-center rounded-full border-[2.5px]">
                    <span className="bg-gr-ink size-[5px] rounded-full" />
                  </span>
                  <span className="bg-gr-ink h-[10px] w-[2px] rounded-full" />
                </div>
              </div>
            )}
          </div>

          <span aria-hidden className="gr-screen-top pointer-events-none absolute inset-x-0 top-0 z-10 h-[150px]" />

          <div className="text-gr-ink pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 pt-[11px] text-[11px] font-semibold">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <Signal aria-hidden className="size-3" />
              <Wifi aria-hidden className="size-3" />
              <BatteryFull aria-hidden className="size-3.5" />
            </span>
          </div>
          <span className="absolute top-[8px] left-1/2 z-10 h-[20px] w-[72px] -translate-x-1/2 rounded-full bg-black" />

          <div className="absolute inset-x-3 top-[38px] z-10">
            <div className="flex items-center justify-between px-1">
              <span className="flex items-center gap-1.5 text-[13px] font-bold tracking-[-0.02em]">
                <GorideLogoMark className="size-[18px]" />
                {BRAND.name}
              </span>
              <span className="gr-avatar grid size-6 place-items-center rounded-full text-[9px] font-bold">You</span>
            </div>
            <div className="gr-search mt-2 rounded-[12px] px-3 py-2">
              <span className="flex items-center gap-2">
                <MapPin aria-hidden className="size-3.5 shrink-0" />
                <span className="min-w-0">
                  <span className="text-gr-grey block text-[9.5px] leading-tight">Pickup</span>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <m.span
                      key={district}
                      initial={{ opacity: 0, transform: 'translateY(6px)' }}
                      animate={{ opacity: 1, transform: 'translateY(0px)' }}
                      exit={{ opacity: 0, transform: 'translateY(-6px)' }}
                      transition={{ duration: 0.25, ease: EASE_OUT }}
                      className="block truncate text-[12.5px] leading-tight font-semibold"
                    >
                      {district}
                    </m.span>
                  </AnimatePresence>
                </span>
              </span>
              <span className="border-gr-line mt-1.5 flex items-center gap-2 border-t pt-1.5">
                <Flag aria-hidden className="size-3.5 shrink-0" />
                <span className={cn('truncate text-[11.5px]', trip ? 'font-semibold' : 'text-gr-grey')}>
                  {trip ? trip.name : 'Tap the city to add a drop-off'}
                </span>
              </span>
            </div>
          </div>

          <div
            onPointerDown={holdStill}
            className="gr-sheet absolute inset-x-0 bottom-0 z-10 flex min-h-[33%] flex-col rounded-t-[22px] px-3.5 pt-2 pb-3"
          >
            <span className="bg-gr-ink/15 mx-auto mb-2 block h-1 w-8 shrink-0 rounded-full" />

            <AnimatePresence mode="wait" initial={false}>
              {planning && (
                <m.div key="plan" {...sheet} className="flex min-h-0 flex-1 flex-col">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[13px] leading-tight font-semibold">
                      {trip ? `Ride to ${trip.name}` : 'Choose a ride'}
                    </p>
                    <span className="text-gr-grey shrink-0 text-[10.5px]">
                      {trip ? `${trip.minutes} min trip` : nearby > 0 ? `${nearby} nearby` : `nearest ${eta} min`}
                    </span>
                  </div>
                  <div role="radiogroup" aria-label="Ride type" className="mt-2 grid grid-cols-3 gap-1.5">
                    {RIDES.map((item, index) => {
                      const Icon = ICONS[item.id] ?? CarFront;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="radio"
                          aria-checked={index === ride}
                          disabled={status === 'finding'}
                          onClick={() => onRide(index)}
                          className={cn(
                            'gr-focus flex cursor-pointer flex-col items-center rounded-[12px] border py-1.5 transition-colors duration-200',
                            index === ride ? 'border-gr-ink bg-gr-accent/10' : 'border-gr-line hover:border-gr-ink/30'
                          )}
                        >
                          <Icon aria-hidden className="size-4" />
                          <span className="mt-0.5 text-[11px] font-semibold">{item.label}</span>
                          <span className="text-gr-grey text-[10px]">
                            {fareFor(index) ? `${fareFor(index)} · ${etas[index] ?? 1}m` : `${etas[index] ?? 1} min`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="border-gr-line mt-2 flex items-center gap-2 border-t pt-2 text-[11px]">
                    <span className="gr-pay-mark flex h-5 shrink-0 items-center gap-px rounded-[5px] px-1.5 text-[9px] font-semibold">
                      <GorideAppleIcon className="size-2.5" />
                      Pay
                    </span>
                    <span className="text-gr-grey min-w-0 flex-1 truncate">{PAYMENT.note}</span>
                    <ChevronRight aria-hidden className="text-gr-grey size-3.5" />
                  </div>
                  <HoldToBook
                    label={status === 'finding' ? 'Finding your driver' : `Hold to book ${RIDES[ride].label}`}
                    kind={RIDES[ride].id}
                    busy={status === 'finding'}
                    onBook={onBook}
                  />
                </m.div>
              )}

              {(status === 'coming' || status === 'arrived') && (
                <m.div key="driver" {...sheet} className="flex min-h-0 flex-1 flex-col">
                  <div className="flex items-center gap-2.5">
                    <span className="gr-avatar grid size-9 shrink-0 place-items-center rounded-full text-[11px] font-bold">
                      {DRIVER.initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-semibold">{DRIVER.name}</span>
                      <span className="text-gr-grey flex items-center gap-1 text-[10px] whitespace-nowrap">
                        <Star aria-hidden className="fill-gr-accent text-gr-accent size-3" />
                        {DRIVER.rating} · {DRIVER.trips}
                      </span>
                    </span>
                    <span className="text-right leading-tight">
                      <span className="gr-plate block rounded-[5px] px-1.5 py-0.5 text-[9.5px] font-bold tracking-[0.04em]">
                        {DRIVER.plate}
                      </span>
                      <span className="text-gr-grey mt-0.5 block text-[9.5px]">{RIDES[ride].vehicle}</span>
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-end justify-between">
                    <p className="text-[17px] leading-none font-semibold tracking-[-0.02em]">
                      {status === 'arrived' ? 'Your ride is here' : `Arriving in ${minutes} min`}
                    </p>
                    <span className="gr-pin-code rounded-[7px] px-2 py-1 text-[10px] font-semibold">
                      PIN <b className="tracking-[0.12em]">{DRIVER.pin}</b>
                    </span>
                  </div>

                  <TripBar progress={progress} kind={RIDES[ride].id} />

                  <div className="mt-auto grid grid-cols-4 gap-1.5">
                    {ACTIONS.map((action) => (
                      <span
                        key={action.label}
                        className="gr-action flex flex-col items-center gap-0.5 rounded-[10px] py-1.5"
                      >
                        <action.Icon
                          aria-hidden
                          className={cn('size-3.5', action.label === 'Safety' && 'text-[#D9483B]')}
                        />
                        <span className="text-[9.5px] font-medium">{action.label}</span>
                      </span>
                    ))}
                  </div>
                </m.div>
              )}

              {status === 'trip' && (
                <m.div key="trip" {...sheet} className="flex min-h-0 flex-1 flex-col">
                  <span className="text-gr-grey flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.06em] uppercase">
                    <Navigation aria-hidden className="text-gr-ink size-3" />
                    On your trip
                  </span>
                  <p className="mt-1.5 text-[17px] leading-none font-semibold tracking-[-0.02em]">
                    {minutes} min to {trip?.name}
                  </p>

                  <TripBar progress={progress} kind={RIDES[ride].id} flag />
                  <div className="text-gr-grey mt-1 flex justify-between text-[9.5px]">
                    <span>{district}</span>
                    <span>{trip?.name}</span>
                  </div>

                  <div className="border-gr-line mt-2 flex items-center gap-2 border-t pt-2 text-[11px]">
                    <span className="gr-pay-mark flex h-5 shrink-0 items-center gap-px rounded-[5px] px-1.5 text-[9px] font-semibold">
                      <GorideAppleIcon className="size-2.5" />
                      Pay
                    </span>
                    <span className="min-w-0 flex-1 truncate font-semibold">{fareFor(ride)}</span>
                    <span className="text-gr-grey">
                      {firstName} · {RIDES[ride].vehicle}
                    </span>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-1.5">
                    {ACTIONS.slice(2).map((action) => (
                      <span
                        key={action.label}
                        className="gr-action flex items-center justify-center gap-1.5 rounded-[10px] py-2"
                      >
                        <action.Icon
                          aria-hidden
                          className={cn('size-3.5', action.label === 'Safety' && 'text-[#D9483B]')}
                        />
                        <span className="text-[10.5px] font-semibold">
                          {action.label === 'Share' ? 'Share trip' : 'Safety'}
                        </span>
                      </span>
                    ))}
                  </div>
                </m.div>
              )}

              {status === 'dropped' && (
                <m.div key="dropped" {...sheet} className="flex min-h-0 flex-1 flex-col items-center text-center">
                  <m.span
                    initial={{ transform: 'scale(0.5)' }}
                    animate={{ transform: 'scale(1)' }}
                    transition={{ type: 'spring', stiffness: 420, damping: 16 }}
                    className="bg-gr-accent grid size-9 place-items-center rounded-full"
                  >
                    <Check aria-hidden className="size-4.5" strokeWidth={3} />
                  </m.span>
                  <p className="mt-2 text-[16px] leading-tight font-semibold tracking-[-0.02em]">
                    Welcome to {trip?.name}
                  </p>
                  <p className="text-gr-grey mt-0.5 text-[10.5px]">
                    Paid {fareFor(ride)} with {PAYMENT.method} · thanks for riding
                  </p>
                  <RateDriver name={firstName} />
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- city-stage ----------
const riverPath = (width, height) =>
  `M ${width * 0.36} ${height * 1.04} C ${width * 0.5} ${height * 0.74}, ${width * 0.6} ${height * 0.66}, ${width * 0.74} ${height * 0.5} S ${width * 0.93} ${height * 0.12}, ${width * 1.04} ${height * 0.02}`;

const pathFrom = (points) =>
  points.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');

const CityStage = ({ reduceMotion, start }) => {
  const [city, setCity] = useState(null);
  const [status, setStatus] = useState('idle');
  const [ride, setRide] = useState(0);
  const [dropoff, setDropoff] = useState(null);
  const [hover, setHover] = useState(null);

  const [reading, setReading] = useState({
    district: CITY.districts[2].name,
    etas: RIDES.map(() => 2),
    nearby: 3,
    minutes: 0,
    blocks: 0,
  });

  const stageRef = useRef(null);
  const phoneRef = useRef(null);
  const screenRef = useRef(null);
  const mapRef = useRef(null);
  const routeRef = useRef(null);
  const previewRef = useRef(null);
  const pageRouteRef = useRef(null);
  const pagePreviewRef = useRef(null);
  const pageCarRef = useRef(null);
  const cursorRef = useRef(null);
  const carRefs = useRef([]);
  const fleetRef = useRef(null);
  const statusRef = useRef('idle');
  const dropoffRef = useRef(null);
  const timersRef = useRef([]);

  const progress = useMotionValue(0);

  const river = useMemo(() => (city ? riverPath(city.width, city.height) : ''), [city]);

  const parks = useMemo(
    () => (city ? CITY.parks.map((park) => city.nearestNode(park.x * city.width, park.y * city.height)) : []),
    [city]
  );

  const plan = useMemo(
    () =>
      city ? (
        <GorideCityPlan
          variant="ink"
          width={city.width}
          height={city.height}
          spacing={city.spacing}
          angle={CITY.angle}
          center={city.center}
          reach={city.reach}
          avenueEvery={CITY.avenueEvery}
          river={river}
          parks={parks}
          roads={CITY.roads}
          className="absolute inset-0"
        />
      ) : null,
    [city, river, parks]
  );

  const dropPoint = city && dropoff ? city.toWorld(dropoff.i, dropoff.j) : null;
  const dropName = city && dropPoint ? city.districtAt(dropPoint.x, dropPoint.y) : '';
  const showCar = status === 'coming' || status === 'arrived' || status === 'trip' || status === 'dropped';

  const trip = dropoff
    ? {
        name: dropName,
        fare: FARE.base + reading.blocks * FARE.perBlock,
        minutes: Math.max(1, Math.ceil(reading.blocks * FARE.minutesPerBlock)),
      }
    : null;

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    dropoffRef.current = dropoff;
  }, [dropoff]);

  useEffect(() => {
    const stage = stageRef.current;

    if (!stage) return;

    let size = { width: 0, height: 0 };

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;

      if (width === size.width && Math.abs(height - size.height) < 140 && statusRef.current !== 'idle') return;

      size = { width, height };

      const spacing = width >= 1800 ? CITY.spacingLarge : width >= 1024 ? CITY.spacing : CITY.spacingSmall;
      const next = createCity(width, height, spacing);

      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      fleetRef.current = createFleet(next);
      setCity(next);
      setStatus('idle');
      setDropoff(null);
    });

    observer.observe(stage);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timers = timersRef.current;

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;

    if (!city || !stage) return;

    let frame = 0;
    let onScreen = true;
    let last = window.performance.now();
    let lastReading = '';

    const box = { width: 0, height: 0, left: 0, top: 0 };

    const measure = () => {
      const phone = phoneRef.current;
      const screen = screenRef.current;

      if (!phone || !screen) return;

      box.width = screen.offsetWidth;
      box.height = screen.offsetHeight;
      box.left = phone.offsetLeft + screen.offsetLeft;
      box.top = phone.offsetTop + screen.offsetTop;
    };

    measure();

    const section = stage.parentElement;
    const layoutObserver = new ResizeObserver(measure);
    const styleObserver = new window.MutationObserver(measure);

    layoutObserver.observe(stage);
    if (phoneRef.current) layoutObserver.observe(phoneRef.current);
    if (screenRef.current) layoutObserver.observe(screenRef.current);

    if (section) styleObserver.observe(section, { attributes: true, attributeFilter: ['style'] });
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(measure);

    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      const fleet = fleetRef.current;

      last = now;

      if (fleet && box.width) {
        if (!reduceMotion) fleet.step(dt);
        else if (fleet.state.assigned >= 0 && !fleet.state.arrived) fleet.finish();

        const pin = { x: box.width / 2, y: box.height * LENS.pinY };
        const assigned = fleet.state.assigned >= 0 ? fleet.position(fleet.cars[fleet.state.assigned]) : null;

        const focus = {
          x: box.left + pin.x,
          y: box.top + pin.y,
        };

        const toScreen = (point) => ({
          x: (point.x - focus.x) * LENS.zoom + pin.x,
          y: (point.y - focus.y) * LENS.zoom + pin.y,
        });

        if (mapRef.current) {
          mapRef.current.style.transform = `translate(${pin.x - focus.x * LENS.zoom}px, ${pin.y - focus.y * LENS.zoom}px) scale(${LENS.zoom})`;
        }

        fleet.cars.forEach((car, index) => {
          const seen = toScreen(fleet.position(car));
          const icon = carRefs.current[index];

          if (icon) icon.style.transform = `translate(${seen.x}px, ${seen.y}px) rotate(${car.heading}rad)`;
        });

        if (pageCarRef.current && assigned) {
          const car = fleet.cars[fleet.state.assigned];

          pageCarRef.current.style.transform = `translate(${assigned.x}px, ${assigned.y}px) rotate(${car.heading}rad)`;
        }

        const route = fleet.route();

        progress.set(fleet.state.total > 0 ? 1 - fleet.state.left / fleet.state.total : 0);

        routeRef.current?.setAttribute('d', route.length > 1 ? pathFrom(route.map(toScreen)) : '');
        pageRouteRef.current?.setAttribute('d', route.length > 1 ? pathFrom(route) : '');

        const node = city.nearestNode(focus.x, focus.y);
        const drop = dropoffRef.current;
        const planning = statusRef.current === 'idle' || statusRef.current === 'finding';

        const preview = drop && planning ? [node, ...walk(node, drop)].map((step) => city.toWorld(step.i, step.j)) : [];

        previewRef.current?.setAttribute('d', preview.length > 1 ? pathFrom(preview.map(toScreen)) : '');
        pagePreviewRef.current?.setAttribute('d', preview.length > 1 ? pathFrom(preview) : '');

        const next = {
          district: city.districtAt(focus.x, focus.y),
          etas: RIDES.map((item) => Math.max(1, Math.ceil(fleet.nearest(node, item.id).blocks * CARS.minutesPerBlock))),
          nearby: fleet.countNear(node, CARS.nearby),
          minutes: Math.max(1, Math.ceil(fleet.state.left * CARS.minutesPerBlock)),
          blocks: drop ? Math.abs(drop.i - node.i) + Math.abs(drop.j - node.j) : 0,
        };

        const key = `${next.district}|${next.etas.join(',')}|${next.nearby}|${next.minutes}|${next.blocks}`;

        if (key !== lastReading) {
          lastReading = key;
          setReading((previous) => (planning ? next : { ...next, blocks: previous.blocks }));
        }

        if (fleet.state.arrived && statusRef.current === 'coming') {
          statusRef.current = 'arrived';
          setStatus('arrived');
        }

        if (fleet.state.arrived && statusRef.current === 'trip') {
          statusRef.current = 'dropped';
          setStatus('dropped');
        }
      }

      frame = requestAnimationFrame(loop);
    };

    const sync = () => {
      const run = onScreen && !document.hidden;

      if (run && !frame) {
        last = window.performance.now();
        frame = requestAnimationFrame(loop);
      } else if (!run && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const observer = new window.IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });

    frame = requestAnimationFrame(loop);
    observer.observe(stage);
    document.addEventListener('visibilitychange', sync);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      layoutObserver.disconnect();
      styleObserver.disconnect();
      window.removeEventListener('resize', measure);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [city, progress, reduceMotion]);

  useEffect(() => {
    if (status !== 'arrived' && status !== 'dropped') return;

    const timer = setTimeout(
      () => {
        const fleet = fleetRef.current;

        if (status === 'arrived' && dropoffRef.current && fleet) {
          fleet.driveTo(dropoffRef.current);
          setStatus('trip');

          return;
        }

        fleet?.release();
        setStatus('idle');
        setDropoff(null);
      },
      (status === 'arrived' ? BOOKING.pickup : BOOKING.hold) * 1000
    );

    return () => clearTimeout(timer);
  }, [status]);

  const handleBook = () => {
    const fleet = fleetRef.current;
    const phone = phoneRef.current;
    const screen = screenRef.current;

    if (!fleet || !phone || !screen || !city) return;

    setStatus('finding');

    const focusX = phone.offsetLeft + screen.offsetLeft + screen.offsetWidth / 2;
    const focusY = phone.offsetTop + screen.offsetTop + screen.offsetHeight * LENS.pinY;
    const pickup = city.nearestNode(focusX, focusY);

    timersRef.current.push(
      setTimeout(() => {
        if (fleetRef.current !== fleet) return;

        fleet.dispatch(pickup, RIDES[ride].id);
        setStatus('coming');
      }, BOOKING.search * 1000)
    );
  };

  const onPhone = (target) => target instanceof window.Element && !!target.closest('.gr-phone-spot');

  const onCopy = (stage, clientX, clientY) => {
    const copy = stage.parentElement?.querySelector('.gr-copy')?.getBoundingClientRect();
    const margin = 32;

    return (
      !!copy &&
      clientX > copy.left - margin &&
      clientX < copy.right + margin &&
      clientY > copy.top - margin &&
      clientY < copy.bottom + margin
    );
  };

  const handleTap = (event) => {
    if (!city || onPhone(event.target) || status !== 'idle') return;
    if (onCopy(event.currentTarget, event.clientX, event.clientY)) return;

    const box = event.currentTarget.getBoundingClientRect();

    setDropoff(city.nearestNode(event.clientX - box.left, event.clientY - box.top));
  };

  const handlePointer = (event) => {
    const tag = cursorRef.current;

    if (!city || !tag) return;

    const free =
      event.pointerType === 'mouse' &&
      !onPhone(event.target) &&
      status === 'idle' &&
      !onCopy(event.currentTarget, event.clientX, event.clientY);

    const box = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - box.left;
    const py = event.clientY - box.top;

    tag.style.transform = `translate(${px}px, ${py}px)`;
    tag.style.opacity = free ? '1' : '0';
    event.currentTarget.style.cursor = free ? 'crosshair' : '';

    const name = free ? city.districtAt(px, py) : null;

    if (name !== hover) setHover(name);
  };

  const handleLeave = () => {
    if (cursorRef.current) cursorRef.current.style.opacity = '0';
    setHover(null);
  };

  return (
    <div
      ref={stageRef}
      onClick={handleTap}
      onPointerMove={handlePointer}
      onPointerLeave={handleLeave}
      className="absolute inset-0"
    >
      {city && (
        <>
          <m.div
            key={start}
            aria-hidden
            initial={{ '--gr-reveal': reduceMotion ? '170%' : '0%' }}
            animate={{ '--gr-reveal': '170%' }}
            transition={{ duration: reduceMotion ? 0 : 1.8, delay: reduceMotion ? 0 : start, ease: EASE_OUT }}
            className="gr-reveal pointer-events-none absolute inset-0"
          >
            <div className="gr-plan absolute inset-0">
              {plan}

              {CITY.districts.map((item) => (
                <span
                  key={item.name}
                  style={{ left: `${item.x * 100}%`, top: `${item.y * 100}%` }}
                  className={cn(
                    'gr-district font-gr-display absolute -translate-x-1/2 -translate-y-1/2 font-semibold whitespace-nowrap',
                    item.name === reading.district && 'gr-district-on',
                    item.name === hover && item.name !== reading.district && 'gr-district-hover'
                  )}
                >
                  {item.name}
                </span>
              ))}

              <GorideRouteLayer
                previewRef={pagePreviewRef}
                routeRef={pageRouteRef}
                className="absolute inset-0 size-full overflow-visible"
              />
            </div>
          </m.div>

          <AnimatePresence>
            {dropPoint && trip && (
              <m.div
                key={`${dropoff?.i}:${dropoff?.j}`}
                initial={{ opacity: 0, transform: 'translateY(-16px) scale(0.8)' }}
                animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
                exit={{ opacity: 0, transform: 'translateY(0px) scale(0.8)' }}
                transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                style={{ left: dropPoint.x, top: dropPoint.y }}
                className="pointer-events-none absolute z-10"
              >
                <span className="gr-flag absolute bottom-[18px] left-0 flex -translate-x-1/2 items-center gap-2 rounded-full py-1.5 pr-3.5 pl-1.5 text-[12.5px] font-semibold whitespace-nowrap">
                  <span className="bg-gr-ink grid size-6 place-items-center rounded-full text-white">
                    <Flag aria-hidden className="size-3" />
                  </span>
                  {trip.name}
                  <span className="text-gr-grey font-medium">
                    {money.format(trip.fare * RIDES[ride].price)} · {trip.minutes} min
                  </span>
                </span>
                <span className="gr-flag-stem absolute bottom-0 left-0 h-[18px] w-[2px] -translate-x-1/2" />
                <span className="bg-gr-ink absolute top-0 left-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full" />
              </m.div>
            )}
          </AnimatePresence>

          <div
            ref={pageCarRef}
            aria-hidden
            className={cn(
              'pointer-events-none absolute top-0 left-0 z-10 transition-opacity duration-300 will-change-transform',
              showCar ? 'opacity-100' : 'opacity-0'
            )}
          >
            <VehicleIcon kind={RIDES[ride].id} length={26} className="gr-lens-car" />
          </div>

          <div
            ref={cursorRef}
            aria-hidden
            className={cn(
              'pointer-events-none absolute top-0 left-0 z-10 opacity-0 transition-opacity duration-200',
              status !== 'idle' && 'invisible'
            )}
          >
            <span className="gr-cursor-ring absolute top-0 left-0 size-7 -translate-x-1/2 -translate-y-1/2 rounded-full" />
            <span className="gr-cursor-tag absolute top-4 left-4 rounded-full px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap">
              Go to {hover}
            </span>
          </div>

          <div ref={phoneRef} className="gr-phone-spot absolute z-20">
            <span aria-hidden className="gr-phone-glow pointer-events-none absolute" />
            <m.div
              initial={reduceMotion ? false : { opacity: 0, transform: 'translateY(-70px) rotate(-5deg)' }}
              animate={{ opacity: 1, transform: 'translateY(0px) rotate(0deg)' }}
              transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.15 }}
              className="relative"
            >
              <PhoneLens
                city={city}
                river={river}
                parks={parks}
                screenRef={screenRef}
                mapRef={mapRef}
                routeRef={routeRef}
                previewRef={previewRef}
                carRefs={carRefs}
                district={reading.district}
                etas={reading.etas}
                nearby={reading.nearby}
                minutes={reading.minutes}
                trip={trip}
                progress={progress}
                status={status}
                ride={ride}
                onRide={setRide}
                onBook={handleBook}
              />
            </m.div>
          </div>
        </>
      )}
    </div>
  );
};

// ---------- hero-copy ----------
const HIDDEN = { opacity: 0.01, transform: 'translateY(16px)' };

const rise = (delay, ready) => ({
  initial: HIDDEN,
  animate: ready ? { opacity: 1, transform: 'translateY(0px)' } : HIDDEN,
  transition: { duration: 0.7, delay, ease: EASE_OUT },
});

const count = new Intl.NumberFormat('en-US');

const subscribeNever = () => () => {};

const repeatWhileShown = (target, every, first, run) => {
  let timer;
  let onScreen = true;
  let due = first;
  let since = 0;

  const schedule = () => {
    since = window.performance.now();
    timer = setTimeout(() => {
      run();
      due = every;
      schedule();
    }, due);
  };

  const sync = () => {
    const go = onScreen && !document.hidden;

    if (go && timer === undefined) {
      schedule();
    } else if (!go && timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
      due = Math.max(0, due - (window.performance.now() - since));
    }
  };

  const observer = new window.IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    sync();
  });

  schedule();
  observer.observe(target);
  document.addEventListener('visibilitychange', sync);

  return () => {
    clearTimeout(timer);
    observer.disconnect();
    document.removeEventListener('visibilitychange', sync);
  };
};

const Phrase = ({ text }) => (
  <span className="gr-phrase inline-flex flex-wrap gap-x-[0.26em]">
    {text.split(' ').map((word, index) => (
      <m.span
        key={`${word}-${index}`}
        initial={{ opacity: 0, transform: 'translateY(0.35em)', filter: 'blur(10px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)', filter: 'blur(0px)' }}
        exit={{
          opacity: 0,
          transform: 'translateY(-0.3em)',
          filter: 'blur(10px)',
          transition: { duration: 0.4, delay: index * 0.05, ease: [0.4, 0, 1, 1] },
        }}
        transition={{ duration: 0.75, delay: 0.15 + index * 0.09, ease: EASE_OUT }}
        className="inline-block"
      >
        {word}
      </m.span>
    ))}
  </span>
);

const Ticker = ({ value }) => {
  const textRef = useRef(null);
  const shown = useMotionValue(value);

  useMotionValueEvent(shown, 'change', (latest) => {
    if (textRef.current) textRef.current.textContent = count.format(Math.round(latest));
  });

  useEffect(() => {
    const run = animate(shown, value, { duration: 0.9, ease: EASE_OUT });

    return () => run.stop();
  }, [shown, value]);

  return (
    <span ref={textRef} className="tabular-nums">
      {count.format(value)}
    </span>
  );
};

const HeroCopy = ({ reduceMotion, start }) => {
  const { COPY, LIVE } = useGoride();

  const [phrase, setPhrase] = useState(0);
  const [city, setCity] = useState(0);
  const [rides, setRides] = useState(LIVE.cities[0]?.rides ?? 0);

  const rootRef = useRef(null);

  const ready = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  );

  const at = (delay) => (reduceMotion ? 0 : start + delay);

  useEffect(() => {
    const root = rootRef.current;

    if (reduceMotion || !root || COPY.phrases.length < 2) return;

    return repeatWhileShown(root, COPY.phraseEvery * 1000, (start + 1.4 + COPY.phraseEvery) * 1000, () =>
      setPhrase((value) => (value + 1) % COPY.phrases.length)
    );
  }, [reduceMotion, start, COPY.phraseEvery, COPY.phrases.length]);

  useEffect(() => {
    const root = rootRef.current;

    if (reduceMotion || !root || LIVE.cities.length < 2) return;

    let tick = 0;

    return repeatWhileShown(root, (LIVE.every / 3) * 1000, (LIVE.every / 3) * 1000, () => {
      tick++;

      if (tick % 3 === 0) {
        const next = Math.floor(tick / 3) % LIVE.cities.length;

        setCity(next);
        setRides(LIVE.cities[next].rides);
      } else {
        setRides((value) => value + Math.round(Math.random() * 14) - 4);
      }
    });
  }, [reduceMotion, LIVE.every, LIVE.cities]);

  return (
    <div ref={rootRef} className="gr-copy pointer-events-auto relative z-10 flex flex-col items-start">
      <m.p
        {...rise(at(0), ready)}
        className="gr-ticker flex items-center gap-2.5 rounded-[12px] py-1.5 pr-3.5 pl-1.5 text-[13px]"
      >
        <span className="gr-ticker-tag flex items-center gap-1.5 rounded-[8px] px-2 py-1 text-[10.5px] font-bold tracking-[0.12em]">
          <span aria-hidden className="gr-live-dot" />
          LIVE
        </span>
        <span className="text-gr-ink/70">
          <span className="text-gr-ink font-semibold">
            <Ticker value={rides} />
          </span>{' '}
          <span className="hidden sm:inline">rides on the road in </span>
          <span className="sm:hidden">rides live in </span>
          <span className="relative inline-grid overflow-hidden align-bottom">
            {LIVE.cities.map((item) => (
              <span key={item.name} aria-hidden className="invisible col-start-1 row-start-1 font-semibold">
                {item.name}
              </span>
            ))}
            <AnimatePresence mode="popLayout" initial={false}>
              <m.span
                key={LIVE.cities[city]?.name}
                initial={{ transform: 'translateY(100%)', opacity: 0 }}
                animate={{ transform: 'translateY(0%)', opacity: 1 }}
                exit={{ transform: 'translateY(-100%)', opacity: 0 }}
                transition={{ duration: 0.45, ease: EASE_OUT }}
                className="text-gr-ink col-start-1 row-start-1 inline-block font-semibold"
              >
                {LIVE.cities[city]?.name}
              </m.span>
            </AnimatePresence>
          </span>
        </span>
      </m.p>

      <h1 id="gr-title" className="gr-title font-gr-display mt-5 font-semibold">
        <span className="block overflow-hidden pb-[0.06em]">
          <m.span
            initial={{ transform: 'translateY(105%)' }}
            animate={{ transform: ready ? 'translateY(0%)' : 'translateY(105%)' }}
            transition={{ duration: 0.9, delay: at(0.08), ease: EASE_OUT }}
            className="block"
          >
            {COPY.headline}
          </m.span>
        </span>
        <span className="sr-only">{COPY.phrases[0]}</span>
        <span aria-hidden className="gr-title-line text-gr-accent block min-h-[1em] pb-[0.08em]">
          <m.span
            initial={{ transform: 'translateY(105%)' }}
            animate={{ transform: ready ? 'translateY(0%)' : 'translateY(105%)' }}
            transition={{ duration: 0.9, delay: at(0.2), ease: EASE_OUT }}
            className="block"
          >
            <AnimatePresence mode="wait" initial={false}>
              <Phrase key={COPY.phrases[phrase]} text={COPY.phrases[phrase] ?? ''} />
            </AnimatePresence>
          </m.span>
        </span>
      </h1>

      <m.p
        {...rise(at(0.3), ready)}
        className="gr-lede text-gr-ink/65 mt-5 max-w-[27rem] text-[16px] leading-[1.6] sm:text-[17px]"
      >
        {COPY.lede}
      </m.p>

      <m.div
        {...rise(at(0.42), ready)}
        className="mt-8 grid w-full gap-2.5 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-3"
      >
        <CtaButton href={COPY.primary.href} label={COPY.primary.label} hoverLabel={COPY.primary.hover} />
        <a href={COPY.secondary.href} className="gr-ghost gr-focus group">
          <CarFront aria-hidden className="size-[18px]" />
          {COPY.secondary.label}
        </a>
      </m.div>

      <m.p {...rise(at(0.48), ready)} className="text-gr-ink/55 mt-3.5 flex items-center gap-1 pl-0.5 text-[13px]">
        Available on
        {COPY.stores.map((store, index) => {
          const Icon = store.id === 'android' ? GoridePlayIcon : GorideAppleIcon;

          return (
            <span key={store.id} className="flex items-center gap-1">
              {index > 0 && <span aria-hidden>·</span>}
              <a
                href={store.href}
                className="gr-focus text-gr-ink hover:bg-gr-ink/5 flex items-center gap-1.5 rounded-[7px] px-1.5 py-1 font-medium transition-colors"
              >
                <Icon className="text-gr-ink size-[14px]" />
                {store.label}
              </a>
            </span>
          );
        })}
      </m.p>

      <m.div {...rise(at(0.56), ready)} className="mt-6 flex items-center gap-4">
        <span className="flex">
          {COPY.riders.map((rider, index) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={rider.name}
              src={rider.src}
              alt={rider.name}
              width={112}
              height={112}
              loading="lazy"
              decoding="async"
              style={{ zIndex: COPY.riders.length - index }}
              className="gr-rider relative -ml-2.5 size-9 rounded-full object-cover first:ml-0"
            />
          ))}
        </span>
        <span className="leading-tight">
          <span className="flex items-center gap-1.5">
            <span className="flex gap-0.5">
              {Array.from({ length: 5 }, (_, index) => (
                <m.span
                  key={index}
                  initial={{ transform: 'scale(0.4)', opacity: 0.25 }}
                  animate={ready ? { transform: 'scale(1)', opacity: 1 } : { transform: 'scale(0.4)', opacity: 0.25 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18, delay: at(0.7 + index * 0.08) }}
                >
                  <Star aria-hidden className="fill-gr-accent text-gr-accent size-3.5" />
                </m.span>
              ))}
            </span>
            <span className="text-gr-ink text-[14px] font-bold">{COPY.rating}</span>
          </span>
          <span className="text-gr-ink/60 text-[12.5px] whitespace-nowrap">{COPY.ratingNote}</span>
        </span>
        <span aria-hidden className="bg-gr-ink/10 hidden h-8 w-px sm:block" />
        <span className="hidden leading-tight whitespace-nowrap sm:block">
          <span className="text-gr-ink block text-[15px] font-bold">{COPY.stat.value}</span>
          <span className="text-gr-ink/60 text-[12.5px]">{COPY.stat.label}</span>
        </span>
      </m.div>
    </div>
  );
};

// ---------- hero-section ----------
const HeroSection = () => {
  const sectionRef = useRef(null);
  const copyRef = useRef(null);

  const reduceMotion = useReducedMotionPref();
  const small = useMediaQuery(SPLASH.skip);

  const start = reduceMotion || small ? 0 : INTRO_AT;

  useEffect(() => {
    const section = sectionRef.current;
    const copy = copyRef.current;

    if (!section || !copy) return;

    const measure = () => {
      const bottom = copy.getBoundingClientRect().bottom - section.getBoundingClientRect().top;

      section.style.setProperty('--gr-copy-bottom', `${Math.round(bottom)}px`);
    };

    const observer = new ResizeObserver(measure);

    observer.observe(copy);
    observer.observe(section);
    measure();
    document.fonts?.ready.then(measure);

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} aria-labelledby="gr-title" className="gr-panel bg-gr-panel relative isolate overflow-hidden">
      <CityStage reduceMotion={reduceMotion} start={start} />

      <div className="gr-frame gr-layout pointer-events-none relative">
        <div className="gr-inset w-full">
          <div ref={copyRef} className="gr-container">
            <HeroCopy reduceMotion={reduceMotion} start={start} />
          </div>
        </div>
      </div>
    </section>
  );
};

// ---------- intro-splash ----------
const IntroSplash = () => {
  const { BRAND, TAGLINE } = useGoride();

  const [done, setDone] = useState(false);

  const layerRef = useRef(null);
  const contentRef = useRef(null);

  const reduceMotion = useReducedMotionPref();
  const small = useMediaQuery(SPLASH.skip);

  const skip = reduceMotion || small;

  useEffect(() => {
    const layer = layerRef.current;
    const content = contentRef.current;

    if (!layer || !content || skip) return;

    let cancelled = false;
    let current = null;

    const play = async () => {
      await new Promise((resolve) => setTimeout(resolve, SPLASH.hold * 1000));

      if (cancelled) return;

      const screen = layer.parentElement?.querySelector('.gr-screen')?.getBoundingClientRect();
      const width = window.innerWidth;
      const height = window.innerHeight;

      if (screen && screen.bottom < height + 20) {
        const inset = [screen.top, width - screen.right, height - screen.bottom, screen.left];
        const target = `inset(${inset.map((value) => `${Math.round(value)}px`).join(' ')} round ${Math.round(screen.width * 0.13)}px)`;

        animate(
          content,
          { transform: ['scale(1)', 'scale(0.42)'], opacity: 0 },
          { duration: SPLASH.shrink * 0.7, ease: EASE_OUT }
        );
        current = animate(
          layer,
          { clipPath: ['inset(0px 0px 0px 0px round 0px)', target] },
          { duration: SPLASH.shrink, ease: [0.76, 0, 0.24, 1] }
        );
        await current;
      }

      if (cancelled) return;

      current = animate(layer, { opacity: 0 }, { duration: SPLASH.fade, ease: 'easeOut' });
      await current;

      if (!cancelled) setDone(true);
    };

    play();

    return () => {
      cancelled = true;
      current?.stop();
    };
  }, [skip]);

  if (done || skip) return null;

  return (
    <div ref={layerRef} aria-hidden className="gr-splash fixed inset-0 z-[70] grid place-items-center">
      <div ref={contentRef} className="flex flex-col items-center">
        <m.span
          initial={{ opacity: 0, transform: 'scale(0.6) rotate(-12deg)' }}
          animate={{ opacity: 1, transform: 'scale(1) rotate(0deg)' }}
          transition={{ type: 'spring', stiffness: 240, damping: 16, delay: 0.1 }}
          className="gr-splash-mark grid size-24 place-items-center rounded-[28px]"
        >
          <GorideLogoMark className="size-[72px]" />
        </m.span>
        <m.span
          initial={{ opacity: 0, transform: 'translateY(14px)' }}
          animate={{ opacity: 1, transform: 'translateY(0px)' }}
          transition={{ duration: 0.6, delay: 0.3, ease: EASE_OUT }}
          className="font-gr-display mt-6 text-[44px] leading-none font-bold tracking-[-0.05em]"
        >
          {BRAND.name}
        </m.span>
        <m.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-2 text-[15px] font-medium"
        >
          {TAGLINE}
        </m.span>
        <span className="gr-splash-road relative mt-12 h-0 w-48">
          <span className="gr-splash-car absolute top-0 left-0">
            <VehicleIcon kind="car" length={30} className="block max-w-none" />
          </span>
        </span>
      </div>
    </div>
  );
};

// ---------- navbar ----------
const Navbar = () => {
  const { BRAND, NAV } = useGoride();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(null);

  const headerRef = useRef(null);

  useEffect(() => {
    const header = headerRef.current;
    const root = header?.closest('.gr-root');

    if (!header || !root) return;

    const measure = () => {
      root.style.setProperty('--gr-nav', `${header.getBoundingClientRect().height}px`);
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    const observer = new ResizeObserver(measure);

    observer.observe(header);
    measure();
    handleScroll();
    document.fonts?.ready.then(measure);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const desktop = window.matchMedia('(min-width: 1024px)');

    const handleKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    const handleResize = () => {
      if (desktop.matches) setMenuOpen(false);
    };

    window.addEventListener('keydown', handleKey);
    desktop.addEventListener('change', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKey);
      desktop.removeEventListener('change', handleResize);
    };
  }, [menuOpen]);

  return (
    <header ref={headerRef} data-scrolled={scrolled || menuOpen} className="gr-nav gr-frame sticky top-0 z-50">
      <div className="gr-nav-shell">
        <nav aria-label="Main" className="gr-nav-bar relative flex h-[60px] items-center gap-6 lg:h-[64px]">
          <a href={BRAND.href} className="gr-focus flex items-center gap-2.5 rounded-md">
            <GorideLogoMark className="size-[28px]" />
            <span className="font-gr-display text-[20px] font-bold tracking-[-0.03em]">{BRAND.name}</span>
          </a>

          <ul
            onPointerLeave={() => setHovered(null)}
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 lg:flex"
          >
            {NAV.links.map((link, index) => (
              <li key={link.label} className="relative">
                {hovered === index && (
                  <m.span
                    layoutId="gr-nav-hover"
                    aria-hidden
                    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    className="gr-nav-hover absolute inset-0 rounded-[10px]"
                  />
                )}
                <a
                  href={link.href}
                  aria-current={index === 0 ? 'page' : undefined}
                  onPointerEnter={() => setHovered(index)}
                  onFocus={() => setHovered(index)}
                  onBlur={() => setHovered(null)}
                  className={cn(
                    'gr-focus relative flex items-center gap-1.5 rounded-[10px] px-3.5 py-2 text-[14.5px] font-medium transition-colors duration-200',
                    index === 0 || hovered === index ? 'text-gr-ink' : 'text-gr-ink/60'
                  )}
                >
                  {index === 0 && <span aria-hidden className="bg-gr-accent size-1.5 rounded-full" />}
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-2">
            <a
              href={NAV.signIn.href}
              className="gr-focus text-gr-ink/75 hover:text-gr-ink hidden h-11 items-center rounded-[10px] px-4 text-[14.5px] font-medium transition-colors sm:flex"
            >
              {NAV.signIn.label}
            </a>
            <CtaButton
              href={NAV.cta.href}
              label={NAV.cta.label}
              hoverLabel={NAV.cta.hover}
              size="sm"
              className="hidden sm:inline-flex"
            />
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls={menuOpen ? 'gr-menu' : undefined}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((value) => !value)}
              className="gr-focus border-gr-line text-gr-ink grid size-11 cursor-pointer place-items-center rounded-[12px] border lg:hidden"
            >
              {menuOpen ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <m.div
            id="gr-menu"
            initial={{ opacity: 0, transform: 'translateY(-8px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            exit={{ opacity: 0, transform: 'translateY(-6px)' }}
            transition={{ duration: 0.24, ease: EASE_OUT }}
            className="gr-menu bg-gr-card absolute inset-x-3 top-[calc(100%_+_8px)] rounded-[18px] p-2 sm:inset-x-4 lg:hidden"
          >
            <ul className="grid">
              {NAV.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="gr-focus text-gr-ink hover:bg-gr-panel flex min-h-12 items-center rounded-[12px] px-3 text-[17px] font-medium"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="border-gr-line mt-2 grid grid-cols-2 gap-2 border-t pt-2 sm:hidden">
              <a
                href={NAV.signIn.href}
                className="gr-focus border-gr-line flex h-12 items-center justify-center rounded-[12px] border text-[15px] font-semibold"
              >
                {NAV.signIn.label}
              </a>
              <a href={NAV.cta.href} className="gr-btn gr-focus w-full">
                {NAV.cta.label}
              </a>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
};

// ---------- styles ----------
const BLOCK_CSS = `@layer theme, base, components, utilities;
/* ---------- Shared alignment: the nav and the panel use the same two rules ---------- */

.gr-root {
  --gr-max: 1280px;
  --gr-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --gr-nav: 68px;
}

.gr-frame {
  padding-inline: 12px;
}

.gr-inset {
  padding-inline: 20px;
}

@media (min-width: 640px) {
  .gr-frame {
    padding-inline: 16px;
  }

  .gr-inset {
    padding-inline: 32px;
  }
}

@media (min-width: 1024px) {
  .gr-frame {
    padding-inline: 20px;
  }

  .gr-inset {
    padding-inline: 56px;
  }
}

.gr-root ::selection {
  background: var(--gr-accent);
  color: var(--gr-ink);
}

.gr-focus:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--gr-ink) 45%, transparent);
  outline-offset: 2px;
}

/* ---------- Navigation ---------- */

.gr-nav {
  margin-bottom: calc(-1 * var(--gr-nav));
  padding-top: 12px;
}

.gr-nav-shell {
  margin-inline: 8px;
}

.gr-nav-bar {
  border: 1px solid color-mix(in srgb, var(--gr-ink) 7%, transparent);
  border-radius: 16px;
  padding-inline: 12px 8px;
  background-color: color-mix(in srgb, var(--gr-panel) 72%, transparent);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.7),
    0 12px 30px -20px rgba(60, 45, 20, 0.45);
  -webkit-backdrop-filter: blur(16px) saturate(1.2);
  backdrop-filter: blur(16px) saturate(1.2);
  transition:
    background-color 0.3s,
    box-shadow 0.3s;
}

.gr-nav[data-scrolled='true'] .gr-nav-bar {
  background-color: color-mix(in srgb, var(--gr-panel) 90%, transparent);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.7),
    0 16px 36px -18px rgba(60, 45, 20, 0.5);
}

@media (min-width: 640px) {
  .gr-nav-shell {
    margin-inline: 16px;
  }
}

@media (min-width: 1024px) {
  .gr-nav-shell {
    max-width: calc(var(--gr-max) + 40px);
    margin-inline: max(36px, (100% - var(--gr-max) - 40px) / 2);
  }

  .gr-nav-bar {
    padding-inline: 18px 10px;
  }
}

.gr-nav-hover {
  background-color: color-mix(in srgb, var(--gr-ink) 6%, transparent);
}

.gr-menu {
  border: 1px solid var(--gr-line);
  box-shadow: 0 24px 60px -30px rgba(60, 45, 20, 0.45);
}

/* ---------- Buttons ---------- */

@layer components {
  .gr-btn {
    display: inline-flex;
    height: 52px;
    flex-shrink: 0;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border-radius: 12px;
    padding-inline: 26px;
    background-color: var(--gr-ink);
    color: #fff;
    font-size: 15.5px;
    font-weight: 600;
    white-space: nowrap;
    transition:
      background-color 0.3s var(--gr-ease),
      transform 0.15s var(--gr-ease);
  }

  .gr-btn:hover {
    background-color: color-mix(in srgb, var(--gr-ink) 86%, white);
  }

  .gr-btn:active {
    transform: scale(0.97);
  }
}

/* ---------- Hero panel ---------- */

.gr-panel {
  min-height: calc(var(--gr-copy-bottom, 600px) + 40px + var(--gr-phone) * 2.07 + 36px);
  border-radius: 0 0 28px 28px;
}

.gr-panel::after {
  position: absolute;
  inset: 0;
  z-index: 1;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.35 0 0 0 0 0.3 0 0 0 0 0.22 0 0 0 0.09 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  content: '';
  pointer-events: none;
}

.gr-layout {
  padding-top: calc(var(--gr-nav) + 28px);
}

@media (min-width: 768px) {
  .gr-panel {
    height: 100dvh;
    min-height: 720px;
  }

  .gr-layout {
    display: flex;
    height: 100%;
    align-items: center;
    padding-top: calc(var(--gr-nav) * 0.6);
  }
}

@media (min-width: 1024px) {
  .gr-panel {
    min-height: 680px;
    border-radius: 0 0 40px 40px;
  }
}

.gr-title {
  font-size: min(clamp(2.6rem, 1.2rem + 8vw, 5rem), calc(100cqi / 6.9));
  line-height: 0.92;
  letter-spacing: -0.05em;
}

.gr-title-line {
  white-space: nowrap;
}

.gr-title-line .gr-phrase {
  flex-wrap: nowrap;
}

@media (min-width: 768px) {
  .gr-title {
    font-size: min(3.6rem, calc(100cqi / 6.9));
  }
}

@media (min-width: 1024px) {
  .gr-title {
    font-size: min(clamp(3.6rem, 1.8rem + 4.4vw, 6.8rem), 12dvh, calc(100cqi / 6.9));
  }
}

@media (min-width: 1800px) {
  .gr-title {
    font-size: min(7.6rem, 12dvh, calc(100cqi / 6.9));
  }
}

.gr-container {
  width: 100%;
  max-width: var(--gr-max);
  margin-inline: auto;
}

.gr-copy {
  container-type: inline-size;
  max-width: 540px;
  text-shadow: 0 0 18px var(--gr-panel);
}

@media (min-width: 768px) {
  .gr-copy {
    max-width: calc(100% - var(--gr-phone) - 40px);
  }
}

@media (min-width: 1024px) {
  .gr-copy {
    max-width: min(560px, 100% - var(--gr-phone) - 64px);
  }
}

@media (min-width: 1536px) {
  .gr-copy {
    max-width: min(640px, 100% - var(--gr-phone) - 64px);
  }
}

/* ---------- The city plan ---------- */

@property --gr-reveal {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}

.gr-reveal {
  --gr-origin: 50% 74%;

  -webkit-mask-image: radial-gradient(
    circle at var(--gr-origin),
    #000 calc(var(--gr-reveal) - 16%),
    transparent var(--gr-reveal)
  );
  mask-image: radial-gradient(
    circle at var(--gr-origin),
    #000 calc(var(--gr-reveal) - 16%),
    transparent var(--gr-reveal)
  );
}

.gr-plan {
  -webkit-mask-image: linear-gradient(to bottom, transparent 20%, #000 46%);
  mask-image: linear-gradient(to bottom, transparent 20%, #000 46%);
}

@media (min-width: 768px) {
  .gr-reveal {
    --gr-origin: 76% 50%;
  }

  .gr-plan {
    -webkit-mask-image: linear-gradient(100deg, rgba(0, 0, 0, 0.12) 18%, rgba(0, 0, 0, 0.35) 34%, #000 56%);
    mask-image: linear-gradient(100deg, rgba(0, 0, 0, 0.12) 18%, rgba(0, 0, 0, 0.35) 34%, #000 56%);
  }
}

.gr-district {
  color: color-mix(in srgb, var(--gr-ink) 8%, transparent);
  font-size: clamp(24px, 3.3vw, 56px);
  letter-spacing: -0.04em;
  transition: color 0.4s var(--gr-ease);
}

.gr-district-on {
  color: color-mix(in srgb, var(--gr-accent) 60%, transparent);
}

.gr-district-hover {
  color: color-mix(in srgb, var(--gr-ink) 18%, transparent);
}

/* ---------- On the paper: the drop-off flag and the pointer's tag ---------- */

.gr-flag {
  background-color: var(--gr-card);
  color: var(--gr-ink);
  box-shadow:
    0 0 0 1px var(--gr-line),
    0 14px 28px -16px rgba(60, 45, 20, 0.5);
}

.gr-flag-stem {
  background-color: var(--gr-ink);
}

.gr-cursor-ring {
  border: 1.5px solid color-mix(in srgb, var(--gr-ink) 45%, transparent);
  background-color: color-mix(in srgb, var(--gr-accent) 16%, transparent);
}

.gr-cursor-tag {
  background-color: var(--gr-ink);
  color: #fff;
}

.gr-phone-glow {
  inset: 8% -55%;
  background: radial-gradient(closest-side, color-mix(in srgb, var(--gr-accent) 26%, transparent), transparent);
  filter: blur(12px);
}

/* ---------- Phone ---------- */

.gr-phone-spot {
  top: calc(var(--gr-copy-bottom, 600px) + 40px);
  left: calc(50% - var(--gr-phone) / 2);
  border-radius: calc(var(--gr-phone) * 0.165);
}

@media (min-width: 768px) {
  .gr-phone-spot {
    top: calc(50% + var(--gr-nav) / 2 - var(--gr-phone) * 1.03);
    left: auto;
    right: 40px;
  }
}

@media (min-width: 1024px) {
  .gr-phone-spot {
    right: calc((100% - min(100% - 152px, var(--gr-max))) / 2 - 10px);
  }
}

.gr-root {
  --gr-phone: min(258px, calc(100vw - 96px));
}

@media (min-width: 768px) {
  .gr-root {
    --gr-phone: clamp(236px, calc((100dvh - var(--gr-nav) - 140px) * 0.47), 268px);
  }
}

@media (min-width: 1024px) {
  .gr-root {
    --gr-phone: clamp(236px, calc((100dvh - var(--gr-nav) - 110px) * 0.47), 300px);
  }
}

@media (min-width: 1800px) {
  .gr-root {
    --gr-phone: clamp(236px, calc((100dvh - var(--gr-nav) - 110px) * 0.47), 340px);
  }
}

.gr-phone {
  width: var(--gr-phone);
  padding: calc(var(--gr-phone) * 0.026);
  border-radius: calc(var(--gr-phone) * 0.165);
  background: linear-gradient(150deg, #d8c9b1 0%, #8a7b67 22%, #3b352e 52%, #a8977c 100%);
  box-shadow:
    0 60px 90px -45px rgba(60, 45, 20, 0.5),
    0 22px 40px -26px rgba(60, 45, 20, 0.45);
}

.gr-bezel {
  padding: calc(var(--gr-phone) * 0.022);
  border-radius: calc(var(--gr-phone) * 0.142);
  background-color: #0d0e10;
}

.gr-screen {
  container-type: inline-size;
  aspect-ratio: 0.46;
  border-radius: calc(var(--gr-phone) * 0.12);
  background-color: var(--gr-mapBlock);
  color: var(--gr-ink);
  isolation: isolate;
}

.gr-screen-top {
  background: linear-gradient(
    to bottom,
    var(--gr-card) 34%,
    color-mix(in srgb, var(--gr-card) 70%, transparent) 70%,
    transparent
  );
}

.gr-lens-car {
  filter: drop-shadow(0 2px 3px rgba(20, 22, 27, 0.3));
}

.gr-pin-shadow {
  background: radial-gradient(closest-side, rgba(20, 22, 27, 0.35), transparent);
}

.gr-search {
  background-color: var(--gr-card);
  box-shadow:
    0 0 0 1px var(--gr-line),
    0 10px 20px -14px rgba(20, 22, 27, 0.5);
}

.gr-sheet {
  background-color: var(--gr-card);
  box-shadow: 0 -12px 24px -18px rgba(20, 22, 27, 0.45);
}

.gr-hold {
  background-color: var(--gr-ink);
  touch-action: none;
}

.gr-avatar {
  border: 1.5px solid var(--gr-accent);
  background-color: var(--gr-accentSoft);
  color: var(--gr-ink);
}

.gr-splash {
  background: radial-gradient(70% 45% at 50% 42%, rgba(255, 255, 255, 0.35), transparent 70%), var(--gr-accent);
  color: var(--gr-ink);
}

@media (max-width: 767px) {
  .gr-splash {
    display: none;
  }
}

.gr-splash-mark {
  background-color: var(--gr-card);
  box-shadow: 0 18px 30px -14px rgba(120, 80, 0, 0.45);
}

.gr-splash-mark svg rect {
  fill: transparent;
}

.gr-splash-road {
  border-top: 2px dashed color-mix(in srgb, var(--gr-ink) 35%, transparent);
}

.gr-splash-car {
  animation: gr-drive 1.6s cubic-bezier(0.65, 0, 0.35, 1) 0.2s both;
}

@keyframes gr-drive {
  from {
    left: 0;
  }

  to {
    left: 100%;
  }
}

/* ---------- Live ticker and riders ---------- */

.gr-ticker {
  background-color: color-mix(in srgb, var(--gr-card) 80%, transparent);
  box-shadow:
    0 0 0 1px var(--gr-line),
    0 10px 24px -18px rgba(60, 45, 20, 0.5);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

.gr-ticker-tag {
  background-color: var(--gr-ink);
  color: #fff;
}

.gr-rider {
  border: 2.5px solid var(--gr-panel);
  background-color: var(--gr-accentSoft);
}

/* ---------- Phone sheet details ---------- */

.gr-pay-mark {
  background-color: var(--gr-ink);
  color: #fff;
}

.gr-plate {
  border: 1px solid color-mix(in srgb, var(--gr-ink) 18%, transparent);
  background-color: var(--gr-panel);
}

.gr-pin-code {
  background-color: var(--gr-accentSoft);
  color: var(--gr-ink);
}

.gr-action {
  background-color: var(--gr-panel);
  color: var(--gr-ink);
}

.gr-rate {
  background-color: var(--gr-panel);
}

/* ---------- Download dock and nav button ---------- */

@layer components {
  .gr-cta {
    position: relative;
    isolation: isolate;
    display: inline-flex;
    height: 56px;
    flex-shrink: 0;
    align-items: center;
    gap: 14px;
    overflow: hidden;
    border-radius: 14px;
    padding: 0 7px 0 22px;
    background: linear-gradient(180deg, #2a2d34 0%, var(--gr-ink) 100%);
    color: #fff;
    font-size: 15.5px;
    font-weight: 600;
    white-space: nowrap;
    text-shadow: none;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.14),
      0 1px 2px rgba(20, 22, 27, 0.3),
      0 14px 28px -14px rgba(20, 22, 27, 0.55);
    transition:
      color 0.45s var(--gr-ease),
      box-shadow 0.3s var(--gr-ease),
      transform 0.15s var(--gr-ease);
  }

  .gr-cta:hover {
    color: var(--gr-ink);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.3),
      0 1px 2px rgba(20, 22, 27, 0.2),
      0 18px 32px -14px color-mix(in srgb, var(--gr-accent) 80%, transparent);
  }

  .gr-cta:active {
    transform: scale(0.97);
  }

  .gr-cta-fill {
    position: absolute;
    inset: 0;
    z-index: -1;
    background-color: var(--gr-accent);
    clip-path: inset(7px 7px 7px calc(100% - 49px) round 10px);
    transition: clip-path 0.55s var(--gr-ease);
  }

  .gr-cta:hover .gr-cta-fill {
    clip-path: inset(0 0 0 0 round 14px);
  }

  .gr-cta-tile {
    display: grid;
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    place-items: center;
    color: var(--gr-ink);
  }

  .gr-cta-arrow {
    width: 18px;
    height: 18px;
    transition: transform 0.45s var(--gr-ease);
  }

  .gr-cta:hover .gr-cta-arrow {
    transform: translate(2px, -2px) rotate(45deg);
  }

  .gr-cta-label {
    grid-area: 1 / 1;
    transition: transform 0.45s var(--gr-ease);
  }

  .gr-cta-label-hover {
    transform: translateY(110%);
  }

  .gr-cta:hover .gr-cta-label-rest {
    transform: translateY(-110%);
  }

  .gr-cta:hover .gr-cta-label-hover {
    transform: translateY(0);
  }

  @media (max-width: 639px) {
    .gr-copy .gr-cta {
      justify-content: space-between;
    }

    .gr-copy .gr-ghost {
      justify-content: center;
    }
  }

  .gr-cta-sm {
    height: 44px;
    gap: 10px;
    border-radius: 12px;
    padding: 0 5px 0 16px;
    font-size: 14.5px;
  }

  .gr-cta-sm .gr-cta-fill {
    clip-path: inset(5px 5px 5px calc(100% - 39px) round 8px);
  }

  .gr-cta-sm:hover .gr-cta-fill {
    clip-path: inset(0 0 0 0 round 12px);
  }

  .gr-cta-sm .gr-cta-tile {
    width: 34px;
    height: 34px;
  }

  .gr-cta-sm .gr-cta-arrow {
    width: 15px;
    height: 15px;
  }

  .gr-ghost {
    display: inline-flex;
    height: 56px;
    align-items: center;
    gap: 9px;
    border-radius: 14px;
    padding: 0 20px 0 18px;
    background-color: color-mix(in srgb, var(--gr-card) 70%, transparent);
    color: var(--gr-ink);
    font-size: 15px;
    font-weight: 600;
    white-space: nowrap;
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--gr-ink) 14%, transparent);
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
    transition:
      box-shadow 0.25s var(--gr-ease),
      background-color 0.25s var(--gr-ease),
      transform 0.15s var(--gr-ease);
  }

  .gr-ghost:hover {
    background-color: var(--gr-card);
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, var(--gr-ink) 32%, transparent),
      0 12px 24px -16px rgba(60, 45, 20, 0.5);
  }

  .gr-ghost svg {
    transition: transform 0.35s var(--gr-ease);
  }

  .gr-ghost:hover svg {
    transform: translateX(2px);
  }

  .gr-ghost:active {
    transform: scale(0.97);
  }
}

.gr-live-dot {
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background-color: var(--gr-accent);
}

.gr-live-dot::after {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-color: var(--gr-accent);
  content: '';
  animation: gr-ping 1.8s var(--gr-ease) infinite;
}

@keyframes gr-ping {
  from {
    transform: scale(1);
    opacity: 0.8;
  }

  to {
    transform: scale(2.8);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gr-cta-fill,
  .gr-cta-label,
  .gr-cta-arrow {
    transition: none;
  }

  .gr-live-dot::after,
  .gr-splash-car {
    animation: none;
  }
}

@layer utilities {
  .bg-gr-accent\\/10{background-color:color-mix(in oklab, var(--gr-accent) 10%, transparent)}
  .bg-gr-accent{background-color:var(--gr-accent)}
  .bg-gr-card{background-color:var(--gr-card)}
  .bg-gr-ink\\/10{background-color:color-mix(in oklab, var(--gr-ink) 10%, transparent)}
  .bg-gr-ink\\/15{background-color:color-mix(in oklab, var(--gr-ink) 15%, transparent)}
  .bg-gr-ink{background-color:var(--gr-ink)}
  .bg-gr-page{background-color:var(--gr-page)}
  .bg-gr-panel{background-color:var(--gr-panel)}
  .border-gr-ink{border-color:var(--gr-ink)}
  .border-gr-line{border-color:var(--gr-line)}
  .fill-gr-accent{fill:var(--gr-accent)}
  .font-gr-display{font-family:'Inter Tight', 'Inter', ui-sans-serif, system-ui, sans-serif}
  .font-gr-sans{font-family:'Inter', ui-sans-serif, system-ui, sans-serif}
  .hover\\:bg-gr-ink\\/5:hover{background-color:color-mix(in oklab, var(--gr-ink) 5%, transparent)}
  .hover\\:bg-gr-panel:hover{background-color:var(--gr-panel)}
  .hover\\:border-gr-ink\\/30:hover{border-color:color-mix(in oklab, var(--gr-ink) 30%, transparent)}
  .hover\\:text-gr-ink:hover{color:var(--gr-ink)}
  .text-gr-accent{color:var(--gr-accent)}
  .text-gr-grey{color:var(--gr-grey)}
  .text-gr-ink\\/25{color:color-mix(in oklab, var(--gr-ink) 25%, transparent)}
  .text-gr-ink\\/55{color:color-mix(in oklab, var(--gr-ink) 55%, transparent)}
  .text-gr-ink\\/60{color:color-mix(in oklab, var(--gr-ink) 60%, transparent)}
  .text-gr-ink\\/65{color:color-mix(in oklab, var(--gr-ink) 65%, transparent)}
  .text-gr-ink\\/70{color:color-mix(in oklab, var(--gr-ink) 70%, transparent)}
  .text-gr-ink\\/75{color:color-mix(in oklab, var(--gr-ink) 75%, transparent)}
  .text-gr-ink{color:var(--gr-ink)}
}
`;

/**
 * GoRide ride-hailing hero: a paper city map with live cars, and a phone that is a window onto it.
 * Tap the map to set a drop-off, hold Book to call a car and follow the ride.
 */
const GoRide = ({
  className,
  theme,
  brand,
  nav,
  copy,
  live,
  driver,
  payment,
  tagline = DEFAULT_CONTENT.tagline,
  reducedMotion,
}) => {
  const content = useMemo(
    () => ({
      brand: { ...DEFAULT_CONTENT.brand, ...brand },
      nav: { ...DEFAULT_CONTENT.nav, ...nav },
      copy: { ...DEFAULT_CONTENT.copy, ...copy },
      live: { ...DEFAULT_CONTENT.live, ...live },
      driver: { ...DEFAULT_CONTENT.driver, ...driver },
      payment: { ...DEFAULT_CONTENT.payment, ...payment },
      tagline,
      reducedMotion,
    }),
    [brand, nav, copy, live, driver, payment, tagline, reducedMotion]
  );

  const themeCss = `.gr-root{${Object.entries({ ...THEME, ...theme })
    .map(([role, value]) => `--gr-${role}:${value};`)
    .join('')}color-scheme:light}`;

  return (
    <GorideContext.Provider value={content}>
      <style>{BLOCK_CSS}</style>
      <style>{themeCss}</style>
      <MotionProvider>
        <div
          data-slot="goride"
          className={cn('gr-root bg-gr-page font-gr-sans text-gr-ink min-h-dvh w-full antialiased', className)}
        >
          <IntroSplash />
          <Navbar />
          <main>
            <HeroSection />
          </main>
        </div>
      </MotionProvider>
    </GorideContext.Provider>
  );
};

export { GoRide };
export default GoRide;
