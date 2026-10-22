import { calculateRank } from './utils/ranks';

function wait(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mockUsers = [
  { id: 1, name: 'Admin WhatNext', email: 'admin.demo@whatsnext.app', role: 'superadmin', password: 'Demo1234', reposts: [],likes: [] },
  { id: 2, name: 'Sofía Ramírez',   email: 'sofia.demo@whatsnext.app', role: 'moderator', password: 'Demo1234', reposts: [],likes: [] },
  { id: 3, name: 'Mateo Duarte',    email: 'mateo.demo@whatsnext.app', role: 'user', password: 'Demo1234', reposts: [],likes: [] },
  { id: 4, name: 'Lucía Fernández', email: 'lucia.demo@whatsnext.app', role: 'user', password: 'Demo1234', reposts: [],likes: [] },
  { id: 5, name: 'Nicolás Peralta', email: 'nicolas.demo@whatsnext.app', role: 'user', password: 'Demo1234', reposts: [],likes: [] },
];

let nextUserId = mockUsers.length + 1;

function poster(title, bg, fg) {
  const text = encodeURIComponent(title);
  return `https://placehold.co/400x600/${bg}/${fg}?text=${text}&font=roboto`;
}

function cast(entries: [string, string][]) {
  return entries.map(([name, character]) => ({ name, character }));
}

function crew(entries: [string, string][]) {
  return entries.map(([name, job]) => ({ name, job }));
}

function trailer(name: string, youtubeKey: string) {
  return { name, site: 'YouTube', key: youtubeKey };
}

// Snapshot of real TMDB metadata. Availability is country-specific and changes over time.
// In production this belongs in the backend/database and should be refreshed periodically.
const movieMetadata = {
  361743: {
    runtime: 131,
    releaseDate: '2022-05-21',
    genres: ['Acción', 'Drama'],
    actors: cast([
      ['Tom Cruise', "Capt. Pete 'Maverick' Mitchell"],
      ['Miles Teller', "Lt. Bradley 'Rooster' Bradshaw"],
      ['Jennifer Connelly', 'Penny Benjamin'],
      ['Bashir Salahuddin', "Wo-1. Bernie 'Hondo' Coleman"],
    ]),
    directors: ['Joseph Kosinski'],
    crew: crew([
      ['Eric Warren Singer', 'Screenplay'],
      ['Claudio Miranda', 'Director of Photography'],
      ['Lady Gaga', 'Original Music Composer'],
      ['Eddie Hamilton', 'Editor'],
      ['Christopher McQuarrie', 'Producer'],
    ]),
    trailers: [trailer('Tráiler oficial', 'qSqVVswa420')],
    watchProviders: {
      AR: {
        stream: ['Paramount Plus', 'MovistarTV', 'Paramount+ Amazon Channel', 'ViX Premium Amazon Channel', 'Universal+ Amazon Channel'],
        rent: ['Apple TV Store', 'MovistarTV', 'Amazon Video'],
        buy: ['Apple TV Store', 'Amazon Video'],
      },
    },
  },
  603692: {
    runtime: 170,
    releaseDate: '2023-03-21',
    genres: ['Acción', 'Suspense', 'Crimen'],
    actors: cast([
      ['Keanu Reeves', 'John Wick'],
      ['Donnie Yen', 'Caine'],
      ['Bill Skarsgård', 'Marquis'],
      ['Ian McShane', 'Winston'],
    ]),
    directors: ['Chad Stahelski'],
    crew: crew([
      ['Shay Hatten', 'Writer'],
      ['Dan Laustsen', 'Director of Photography'],
      ['Tyler Bates', 'Original Music Composer'],
      ['Nathan Orloff', 'Editor'],
      ['Chad Stahelski', 'Producer'],
    ]),
    trailers: [trailer('Tráiler oficial', 'qEVUtrk8_B4')],
    watchProviders: {
      AR: {
        stream: ['Universal+ Amazon Channel'],
        rent: ['Apple TV Store'],
        buy: ['Apple TV Store'],
      },
    },
  },
  872585: {
    runtime: 181,
    releaseDate: '2023-07-19',
    genres: ['Drama', 'Historia', 'Bélica'],
    actors: cast([
      ['Cillian Murphy', 'J. Robert Oppenheimer'],
      ['Emily Blunt', 'Kitty Oppenheimer'],
      ['Matt Damon', 'Leslie Groves'],
      ['Robert Downey Jr.', 'Lewis Strauss'],
    ]),
    directors: ['Christopher Nolan'],
    crew: crew([
      ['Christopher Nolan', 'Writer'],
      ['Hoyte van Hoytema', 'Director of Photography'],
      ['Ludwig Göransson', 'Original Music Composer'],
      ['Jennifer Lame', 'Editor'],
      ['Christopher Nolan', 'Producer'],
    ]),
    trailers: [trailer('Tráiler oficial', 'bK6ldnjE3Y0')],
    watchProviders: {
      AR: {
        stream: ['Universal+ Amazon Channel'],
        rent: ['Apple TV Store', 'Claro video', 'Amazon Video'],
        buy: ['Apple TV Store', 'Amazon Video'],
      },
    },
  },
  278: {
    runtime: 143,
    releaseDate: '1994-09-23',
    genres: ['Drama', 'Crimen'],
    actors: cast([
      ['Tim Robbins', 'Andy Dufresne'],
      ['Morgan Freeman', "Ellis Boyd 'Red' Redding"],
      ['Bob Gunton', 'Warden Norton'],
      ['William Sadler', 'Heywood'],
    ]),
    directors: ['Frank Darabont'],
    crew: crew([
      ['Frank Darabont', 'Screenplay'],
      ['Roger Deakins', 'Director of Photography'],
      ['Thomas Newman', 'Original Music Composer'],
      ['Richard Francis-Bruce', 'Editor'],
      ['Niki Marvin', 'Producer'],
    ]),
    trailers: [trailer('Tráiler oficial', 'PLl99DlL6b4')],
    watchProviders: {
      AR: {
        stream: ['Netflix', 'HBO Max'],
        rent: ['Apple TV Store', 'Claro video'],
        buy: ['Apple TV Store'],
      },
    },
  },
  346698: {
    runtime: 114,
    releaseDate: '2023-07-19',
    genres: ['Comedia', 'Aventura', 'Fantasía'],
    actors: cast([
      ['Margot Robbie', 'Barbie'],
      ['Ryan Gosling', 'Ken'],
      ['America Ferrera', 'Gloria'],
      ['Ariana Greenblatt', 'Sasha'],
    ]),
    directors: ['Greta Gerwig'],
    crew: crew([
      ['Noah Baumbach', 'Writer'],
      ['Rodrigo Prieto', 'Director of Photography'],
      ['Andrew Wyatt', 'Original Music Composer'],
      ['Nick Houy', 'Editor'],
      ['Robbie Brenner', 'Producer'],
    ]),
    trailers: [trailer('Tráiler principal', 'pBk4NYhWNMM')],
    watchProviders: {
      AR: {
        stream: ['HBO Max'],
        rent: ['Apple TV Store'],
        buy: ['Apple TV Store'],
      },
    },
  },
  18785: {
    runtime: 100,
    releaseDate: '2009-06-02',
    genres: ['Comedia'],
    actors: cast([
      ['Bradley Cooper', 'Phil Wenneck'],
      ['Ed Helms', 'Stu Price'],
      ['Zach Galifianakis', 'Alan Garner'],
      ['Justin Bartha', 'Doug Billings'],
    ]),
    directors: ['Todd Phillips'],
    crew: crew([
      ['Jon Lucas', 'Writer'],
      ['Lawrence Sher', 'Director of Photography'],
      ['Christophe Beck', 'Original Music Composer'],
      ['Debra Neil-Fisher', 'Editor'],
      ['Todd Phillips', 'Producer'],
    ]),
    trailers: [trailer('Tráiler oficial', 'tlize92ffnY')],
    watchProviders: {
      AR: {
        stream: ['MovistarTV', 'HBO Max', 'Universal+ Amazon Channel'],
        rent: ['Apple TV Store'],
        buy: ['Apple TV Store'],
      },
    },
  },
  157336: {
    runtime: 169,
    releaseDate: '2014-11-04',
    genres: ['Aventura', 'Drama', 'Ciencia ficción'],
    actors: cast([
      ['Matthew McConaughey', 'Cooper'],
      ['Anne Hathaway', 'Brand'],
      ['Michael Caine', 'Professor Brand'],
      ['Jessica Chastain', 'Murph'],
    ]),
    directors: ['Christopher Nolan'],
    crew: crew([
      ['Jonathan Nolan', 'Writer'],
      ['Hoyte van Hoytema', 'Director of Photography'],
      ['Hans Zimmer', 'Original Music Composer'],
      ['Lee Smith', 'Editor'],
      ['Lynda Obst', 'Producer'],
    ]),
    trailers: [trailer('Tráiler oficial', 'zSWdZVtXT7E')],
    watchProviders: {
      AR: {
        stream: ['Amazon Prime Video', 'MovistarTV', 'HBO Max'],
        rent: ['Apple TV Store', 'Claro video'],
        buy: ['Apple TV Store'],
      },
    },
  },
  693134: {
    runtime: 167,
    releaseDate: '2024-02-27',
    genres: ['Ciencia ficción', 'Aventura'],
    actors: cast([
      ['Timothée Chalamet', 'Paul Atreides'],
      ['Zendaya', 'Chani'],
      ['Rebecca Ferguson', 'Jessica'],
      ['Javier Bardem', 'Stilgar'],
    ]),
    directors: ['Denis Villeneuve'],
    crew: crew([
      ['Denis Villeneuve', 'Screenplay'],
      ['Greig Fraser', 'Director of Photography'],
      ['Hans Zimmer', 'Original Music Composer'],
      ['Joe Walker', 'Editor'],
      ['Cale Boyter', 'Producer'],
    ]),
    trailers: [trailer('Tráiler oficial', 'Way9Dexny3w')],
    watchProviders: {
      AR: {
        stream: ['HBO Max', 'Universal+ Amazon Channel'],
        rent: ['Apple TV Store'],
        buy: ['Apple TV Store'],
      },
    },
  },
  138843: {
    runtime: 112,
    releaseDate: '2013-07-18',
    genres: ['Terror', 'Suspense'],
    actors: cast([
      ['Vera Farmiga', 'Lorraine Warren'],
      ['Patrick Wilson', 'Ed Warren'],
      ['Lili Taylor', 'Carolyn Perron'],
      ['Ron Livingston', 'Roger Perron'],
    ]),
    directors: ['James Wan'],
    crew: crew([
      ['Carey Hayes', 'Screenplay'],
      ['John R. Leonetti', 'Director of Photography'],
      ['Joseph Bishara', 'Original Music Composer'],
      ['Kirk M. Morri', 'Editor'],
      ['Tony DeRosa-Grund', 'Producer'],
    ]),
    trailers: [trailer('Tráiler principal oficial', 'k10ETZ41q5o')],
    watchProviders: {
      AR: {
        stream: ['MovistarTV', 'HBO Max'],
        rent: ['Apple TV Store'],
        buy: ['Apple TV Store'],
      },
    },
  },
  447332: {
    runtime: 91,
    releaseDate: '2018-04-03',
    genres: ['Terror', 'Drama', 'Ciencia ficción'],
    actors: cast([
      ['Emily Blunt', 'Evelyn Abbott'],
      ['John Krasinski', 'Lee Abbott'],
      ['Millicent Simmonds', 'Regan Abbott'],
      ['Noah Jupe', 'Marcus Abbott'],
    ]),
    directors: ['John Krasinski'],
    crew: crew([
      ['Bryan Woods', 'Screenplay'],
      ['Charlotte Bruus Christensen', 'Director of Photography'],
      ['Marco Beltrami', 'Original Music Composer'],
      ['Christopher Tellefsen', 'Editor'],
      ['Brad Fuller', 'Producer'],
    ]),
    trailers: [trailer('Tráiler oficial', 'WR7cc5t7tv8')],
    watchProviders: {
      AR: {
        stream: ['Netflix', 'Paramount Plus', 'MovistarTV', 'Paramount+ Amazon Channel'],
        rent: ['Apple TV Store', 'MovistarTV', 'Amazon Video'],
        buy: ['Apple TV Store', 'Amazon Video'],
      },
    },
  },
  313369: {
    runtime: 128,
    releaseDate: '2016-12-01',
    genres: ['Comedia', 'Drama', 'Romance'],
    actors: cast([
      ['Ryan Gosling', 'Sebastian'],
      ['Emma Stone', 'Mia'],
      ['John Legend', 'Keith'],
      ['Rosemarie DeWitt', 'Laura'],
    ]),
    directors: ['Damien Chazelle'],
    crew: crew([
      ['Damien Chazelle', 'Writer'],
      ['Linus Sandgren', 'Director of Photography'],
      ['Justin Hurwitz', 'Original Music Composer'],
      ['Tom Cross', 'Editor'],
      ['Jordan Horowitz', 'Producer'],
    ]),
    trailers: [trailer('Tráiler oficial — Dreamers', '0pdqf4P9MB8')],
    watchProviders: {
      AR: {
        stream: ['MovistarTV', 'Lionsgate+ Amazon Channel', 'Filmelier Plus Amazon Channel'],
        rent: ['Apple TV Store', 'Claro video'],
        buy: ['Apple TV Store'],
      },
    },
  },
  76341: {
    runtime: 120,
    releaseDate: '2015-05-13',
    genres: ['Acción', 'Aventura', 'Ciencia ficción'],
    actors: cast([
      ['Tom Hardy', 'Max Rockatansky'],
      ['Charlize Theron', 'Imperator Furiosa'],
      ['Nicholas Hoult', 'Nux'],
      ['Hugh Keays-Byrne', 'Immortan Joe'],
    ]),
    directors: ['George Miller'],
    crew: crew([
      ['George Miller', 'Writer'],
      ['John Seale', 'Director of Photography'],
      ['Tom Holkenborg', 'Original Music Composer'],
      ['Margaret Sixel', 'Editor'],
      ['Doug Mitchell', 'Producer'],
    ]),
    trailers: [trailer('Tráiler principal oficial', 'hEJnMQG9ev8')],
    watchProviders: {
      AR: {
        stream: ['Amazon Prime Video', 'MovistarTV', 'HBO Max'],
        rent: ['Apple TV Store', 'Claro video'],
        buy: ['Apple TV Store'],
      },
    },
  },
  414906: {
    runtime: 177,
    releaseDate: '2022-03-01',
    genres: ['Crimen', 'Misterio', 'Suspense'],
    actors: cast([
      ['Robert Pattinson', 'Bruce Wayne / The Batman'],
      ['Zoë Kravitz', 'Selina Kyle'],
      ['Jeffrey Wright', 'Lt. James Gordon'],
      ['Colin Farrell', 'Oz / The Penguin'],
    ]),
    directors: ['Matt Reeves'],
    crew: crew([
      ['Peter Craig', 'Writer'],
      ['Greig Fraser', 'Director of Photography'],
      ['Michael Giacchino', 'Original Music Composer'],
      ['William Hoy', 'Editor'],
      ['Matt Reeves', 'Producer'],
    ]),
    trailers: [trailer('Tráiler principal', 'mqqft2x_Aa4')],
    watchProviders: {
      AR: {
        stream: ['HBO Max', 'Universal+ Amazon Channel'],
        rent: ['Apple TV Store', 'Claro video'],
        buy: ['Apple TV Store'],
      },
    },
  },
};

const mockMovies: any[] = [
  {
    id: 1,
    tmdbId: 361743,
    ...movieMetadata[361743],
    title: 'Top Gun: Maverick',
    overview:
      'Tras más de treinta años de servicio, Maverick entrena a una nueva generación de pilotos para una misión que exige el máximo sacrificio.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/AlWpEpQq0RgZIXVHAHZtFhEvRgd.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/AaV1YIdWKnjAIAOe8UUKBFm327v.jpg',
    featured: false,
  },
  {
    id: 2,
    tmdbId: 603692,
    ...movieMetadata[603692],
    title: 'John Wick 4',
    overview:
      'John Wick descubre una forma de derrotar a la Alta Mesa, pero antes deberá enfrentarse a un nuevo enemigo con poderosas alianzas en todo el mundo.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/mj2Z9HnRSIEk3n7yVPoOY4Uzzfh.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/7I6VUdPj6tQECNHdviJkUHD2u89.jpg',
    featured: false,
  },
  {
    id: 3,
    tmdbId: 872585,
    ...movieMetadata[872585],
    title: 'Oppenheimer',
    overview:
      'El físico J. Robert Oppenheimer lidera el proyecto que desarrolla la bomba atómica y debe afrontar las consecuencias de su creación.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/mJRUREPjTqqMEKwEiM2sdmIGngz.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/neeNHeXjMF5fXoCJRsOmkNGC7q.jpg',
    featured: true,
  },
  {
    id: 4,
    tmdbId: 278,
    ...movieMetadata[278],
    title: 'Cadena perpetua',
    overview:
      'Condenado a cadena perpetua por un crimen que asegura no haber cometido, Andy Dufresne encuentra amistad y esperanza dentro de la prisión de Shawshank.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/uRRTV7p6l2ivtODWJVVAMRrwTn2.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/pNjh59JSxChQktamG3LMp9ZoQzp.jpg',
    featured: false,
  },
  {
    id: 5,
    tmdbId: 346698,
    ...movieMetadata[346698],
    title: 'Barbie',
    overview:
      'Barbie abandona la perfección de Barbieland para descubrir el mundo real y encontrar el origen de una crisis que amenaza su existencia.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/fNtqD4BTFj0Bgo9lyoAtmNFzxHN.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/1esAE8sLJRWWFsLLeh5r3g2WanI.jpg',
    featured: false,
  },
  {
    id: 6,
    tmdbId: 18785,
    ...movieMetadata[18785],
    title: 'Resacón en Las Vegas',
    overview:
      'Tres amigos despiertan después de una despedida de soltero en Las Vegas sin recordar la noche anterior y con el novio desaparecido.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/rqeim09TdaflSvPNVnCTBjUHlKu.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/iuRVt8tFiXDPGgzavhuSa3QHRxD.jpg',
    featured: false,
  },
  {
    id: 7,
    tmdbId: 157336,
    ...movieMetadata[157336],
    title: 'Interstellar',
    overview:
      'Un grupo de exploradores atraviesa un agujero de gusano en busca de un nuevo hogar para la humanidad mientras la Tierra se vuelve inhabitable.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/d1QKiYtceF3GDtxvTFXFAqwwah9.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/8sNiAPPYU14PUepFNeSNGUTiHW.jpg',
    featured: true,
  },
  {
    id: 8,
    tmdbId: 693134,
    ...movieMetadata[693134],
    title: 'Dune: Parte dos',
    overview:
      'Paul Atreides se une a Chani y los Fremen para vengar la destrucción de su familia mientras intenta evitar un futuro terrible.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/xCHmhHeO7aOCMlzcNukGH6Q7EiD.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/eZ239CUp1d6OryZEBPnO2n87gMG.jpg',
    featured: true,
  },
  {
    id: 9,
    tmdbId: 138843,
    ...movieMetadata[138843],
    title: 'Expediente Warren',
    overview:
      'Los investigadores paranormales Ed y Lorraine Warren ayudan a una familia aterrorizada por una presencia oscura en su nueva casa.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/sKuHxkCogdk6YWzTyXYPoo9qd9n.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/ecKQlAEG95k62SMGhvX83oEqANK.jpg',
    featured: false,
  },
  {
    id: 10,
    tmdbId: 447332,
    ...movieMetadata[447332],
    title: 'Un lugar tranquilo',
    overview:
      'Una familia debe vivir en completo silencio para sobrevivir a criaturas que cazan guiándose exclusivamente por el sonido.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/5pairI20KJs1SEa4Z8yAsPR779m.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/nHRUtBwFNnNN70vcQ7lAsjc2T6S.jpg',
    featured: false,
  },
  {
    id: 11,
    tmdbId: 313369,
    ...movieMetadata[313369],
    title: 'La ciudad de las estrellas (La La Land)',
    overview:
      'Una aspirante a actriz y un pianista de jazz se enamoran en Los Ángeles mientras sus ambiciones profesionales ponen a prueba la relación.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/7pFsAaJmiOppVHcldBzg8JKBHwe.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/nlPCdZlHtRNcF6C9hzUH4ebmV1w.jpg',
    featured: false,
  },
  {
    id: 12,
    tmdbId: 76341,
    ...movieMetadata[76341],
    title: 'Mad Max: Furia en la carretera',
    overview:
      'Max se une a Furiosa y a un grupo de rebeldes que escapan de un tirano a través del desierto en una persecución implacable.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/fnY0VRsb31A5RLVCBjuR6EFUlo2.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/gqrnQA6Xppdl8vIb2eJc58VC1tW.jpg',
    featured: false,
  },
  {
    id: 13,
    tmdbId: 414906,
    ...movieMetadata[414906],
    title: 'Batman',
    overview:
      'Un vigilante enmascarado protege Ciudad Gótica de la corrupción y el crimen que consumieron a su familia.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/mo7teil1qH0SxgLijnqeYP1Eb4w.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/rvtdN5XkWAfGX6xDuPL6yYS2seK.jpg',
    featured: true,
  },
];

let nextMovieId = mockMovies.length + 1;

const commentTemplates = [
  'La ambientación te mete de lleno, no pude pausarla ni un segundo.',
  'Buena, pero el final se sintió apurado.',
  'La banda sonora sola ya vale la pena verla.',
  'Un poco larga, pero el segundo acto la salva.',
  'De lo mejor que vi este año, ojalá tenga secuela.',
  'Esperaba más del personaje principal, se queda a mitad de camino.',
  'La fotografía es una locura, cada plano parece un cuadro.',
  'Empieza lenta pero cuando arranca no para.',
];

const mockComments = [];
let nextCommentId = 1;
let templateIndex = 0;
for (const movie of mockMovies) {
  const commentCount = 2 + (movie.id % 3);
  for (let i = 0; i < commentCount; i++) {
    const author = mockUsers[(movie.id + i) % mockUsers.length];
    mockComments.push({
      id: nextCommentId++,
      text: commentTemplates[templateIndex % commentTemplates.length],
      rating: Math.round((2 + ((templateIndex * 37) % 4)) * 2) / 2,
      likes: (templateIndex * 53) % 400,
      reposts: (templateIndex * 7) % 20,
      createdAt: new Date(Date.now() - templateIndex * 3600 * 1000).toISOString(),
      authorId: author.id,
      movieId: movie.id,
    });
    templateIndex++;
  }
}

function toPublicComment(comment) {
  const author = mockUsers.find((u) => u.id === comment.authorId);
  const movie = mockMovies.find((m) => m.id === comment.movieId);
  return {
    id: comment.id,
    text: comment.text,
    rating: comment.rating,
    likes: comment.likes,
    reposts: comment.reposts,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt ?? null,
    photo: comment.photo ?? null,
    author: author ? { id: author.id, name: author.name } : null,
    movie: movie ? {
      id: movie.id,
      title: movie.title,
      releaseDate: movie.releaseDate,
      genres: movie.genres,
      posterUrl: movie.posterUrl,
    } : undefined,
  };
}

function averageRating(movieId) {
  const rated = mockComments.filter((c) => c.movieId === movieId && c.rating !== null);
  if (!rated.length) return null;
  return Math.round((rated.reduce((sum, c) => sum + c.rating, 0) / rated.length) * 10) / 10;
}

function reviewsInLast30Days(movieId) {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  return mockComments.filter((comment) => {
    const createdAt = new Date(comment.createdAt).getTime();
    return comment.movieId === movieId && createdAt >= thirtyDaysAgo && createdAt <= now;
  }).length;
}

function withCommentsCount(movie) {
  const commentsCount = mockComments.filter((c) => c.movieId === movie.id).length;
  return {
    ...movie,
    commentsCount,
    reviewsLast30Days: reviewsInLast30Days(movie.id),
    communityRating: averageRating(movie.id),
  };
}

function requireSuperadmin(userId) {
  const actor = mockUsers.find((user) => user.id === Number(userId));
  if (actor?.role !== 'superadmin') {
    throw new Error('Solo un superadministrador puede modificar películas');
  }
}


export async function mockLogin({ email, password }) {
  await wait();
  const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    throw new Error('Email o contraseña incorrectos');
  }
  return toPublicUser(user);
}

export async function mockRegister({ name, email, password }) {
  await wait();
  const exists = mockUsers.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) throw new Error('Ya existe una cuenta con ese email');
  const user = { id: nextUserId++, name, email, role: 'user', password, reposts: [], likes: [] };
  mockUsers.push(user);
  return toPublicUser(user);
}
export async function mockUpdateUser(userId, { name, email }) {
  await wait();
  const user = mockUsers.find((u) => u.id === userId);
  if (!user) throw new Error('Usuario no encontrado');
  const taken = mockUsers.some((u) => u.id !== userId && u.email.toLowerCase() === email.toLowerCase());
  if (taken) throw new Error('Ese email ya está en uso');
  Object.assign(user, { name, email });
  return toPublicUser(user);
}



function toPublicUser({ password, ...user }: { id: number; name: string; email: string; role: string; password: string, reposts: any[], likes: any[] }) {
  return user;
}

export async function mockGetMovies() {
    await wait();
    return mockMovies
      .map(withCommentsCount)
      .sort((a, b) => (b.communityRating ?? 0) - (a.communityRating ?? 0));
  }


export async function mockGetMovie(id) {
  await wait();
  const movie = mockMovies.find((m) => m.id === id);
  if (!movie) return null;
  return withCommentsCount(movie);
}

export async function mockGetRecommendations(id) {
  await wait();
  const movie = mockMovies.find((m) => m.id === id);
  if (!movie) return [];
  return mockMovies
  .filter(
    (candidate) =>
      candidate.id !== movie.id &&
      candidate.genres.some((genre) => movie.genres.includes(genre))
  )
  .map(withCommentsCount)
  .sort((a, b) => (b.communityRating ?? 0) - (a.communityRating ?? 0))
  .slice(0, 6);
}

export async function mockCreateMovie(data, actorId) {
  await wait();
  requireSuperadmin(actorId);
  const movie = {
    id: nextMovieId++,
    tmdbId: data.tmdbId ?? null,
    title: data.title,
    overview: data.overview,
    runtime: data.runtime ? Number(data.runtime) : null,
    releaseDate: data.releaseDate ?? null,
    genres: data.genres ?? [],
    actors: data.actors ?? [],
    directors: data.directors ?? [],
    crew: data.crew ?? [],
    trailers: data.trailers ?? [],
    watchProviders: data.watchProviders ?? {},
    posterUrl: data.posterUrl || poster(data.title, '1c2228', '40bcf4'),
    backdropUrl: data.backdropUrl || null,
    featured: Boolean(data.featured),
  };
  mockMovies.push(movie);
  return withCommentsCount(movie);
}

export async function mockUpdateMovie(id, data, actorId) {
  await wait();
  requireSuperadmin(actorId);
  const movie = mockMovies.find((m) => m.id === id);
  if (!movie) throw new Error('Película no encontrada');
  Object.assign(movie, {
    ...(data.tmdbId !== undefined && { tmdbId: data.tmdbId }),
    ...(data.title !== undefined && { title: data.title }),
    ...(data.overview !== undefined && { overview: data.overview }),
    ...(data.runtime !== undefined && { runtime: Number(data.runtime) || null }),
    ...(data.releaseDate !== undefined && { releaseDate: data.releaseDate }),
    ...(data.genres !== undefined && { genres: data.genres }),
    ...(data.actors !== undefined && { actors: data.actors }),
    ...(data.directors !== undefined && { directors: data.directors }),
    ...(data.crew !== undefined && { crew: data.crew }),
    ...(data.trailers !== undefined && { trailers: data.trailers }),
    ...(data.watchProviders !== undefined && { watchProviders: data.watchProviders }),
    ...(data.posterUrl !== undefined && { posterUrl: data.posterUrl }),
    ...(data.backdropUrl !== undefined && { backdropUrl: data.backdropUrl }),
    ...(data.featured !== undefined && { featured: Boolean(data.featured) }),
  });
  return withCommentsCount(movie);
}

export async function mockDeleteMovie(id, actorId) {
  await wait();
  requireSuperadmin(actorId);
  const index = mockMovies.findIndex((m) => m.id === id);
  if (index === -1) throw new Error('Película no encontrada');
  mockMovies.splice(index, 1);
  for (let i = mockComments.length - 1; i >= 0; i--) {
    if (mockComments[i].movieId === id) mockComments.splice(i, 1);
  }
}

export async function mockGetComments(movieId) {
  await wait();
  return mockComments
    .filter((c) => c.movieId === movieId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(toPublicComment);
}

export async function mockGetUserComments(userId) {
  await wait();
  return mockComments
    .filter((c) => c.authorId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(toPublicComment);
}

export async function mockPostComment(movieId, authorId, text, rating?: number, photo?: string){
  await wait();
  const numericAuthorId = Number(authorId);
  if (!mockUsers.some((user) => user.id === numericAuthorId)) {
    throw new Error('Usuario no encontrado');
  }
  if (!mockMovies.some((movie) => movie.id === movieId)) {
    throw new Error('Película no encontrada');
  }
  const existingReview = mockComments.find(
    (comment) => comment.movieId === movieId && comment.authorId === numericAuthorId
  );
  if (existingReview) {
    const error = new Error('Ya reseñaste esta película. Podés editar tu reseña existente.');
    (error as Error & { code: string }).code = 'REVIEW_ALREADY_EXISTS';
    throw error;
  }

  const comment = {
    id: nextCommentId++,
    text,
    rating: rating ?? null,
    likes: 0,
    reposts: 0,
    createdAt: new Date().toISOString(),
    authorId: numericAuthorId,
    movieId,
    photo: photo ?? null,
  };
  mockComments.push(comment);
  return toPublicComment(comment);
}

export async function mockUpdateComment(
  commentId,
  authorId,
  { text, rating, photo }: { text: string; rating?: number | null; photo?: string | null }
) {
  await wait();
  const comment = mockComments.find((item) => item.id === commentId);
  if (!comment) throw new Error('Reseña no encontrada');
  if (comment.authorId !== Number(authorId)) {
    throw new Error('No tenés permiso para editar esta reseña');
  }

  Object.assign(comment, {
    text,
    rating: rating ?? null,
    photo: photo ?? null,
    updatedAt: new Date().toISOString(),
  });
  return toPublicComment(comment);
}

export async function mockDeleteComment(commentId, requesterId) {
  await wait();
  const index = mockComments.findIndex((c) => c.id === commentId);
  if (index === -1) throw new Error('Reseña no encontrada');

  const requester = mockUsers.find((user) => user.id === Number(requesterId));
  if (!requester) throw new Error('Usuario no encontrado');

  const comment = mockComments[index];
  const canModerate = requester.role === 'moderator' || requester.role === 'superadmin';
  if (comment.authorId !== requester.id && !canModerate) {
    throw new Error('No tenés permiso para borrar esta reseña');
  }

  mockComments.splice(index, 1);
  mockNotifications = mockNotifications.filter((notification) => notification.commentId !== commentId);
  for (const user of mockUsers) {
    const likeIndex = user.likes.indexOf(commentId);
    if (likeIndex !== -1) user.likes.splice(likeIndex, 1);
    const repostIndex = user.reposts.indexOf(commentId);
    if (repostIndex !== -1) user.reposts.splice(repostIndex, 1);
  }
}

export async function mockLikeComment(commentId, userId) {
  await wait();
  const comment = mockComments.find((c) => c.id === commentId);
  const user = mockUsers.find((u) => u.id === userId);
  if (!comment) throw new Error('Reseña no encontrada');
  if (!user) throw new Error('Usuario no encontrado');

  const index = user.likes.indexOf(commentId);
  if (index === -1) {
    user.likes.push(commentId);
    comment.likes += 1;
    createNotification({
      recipientId: comment.authorId,
      actorId: user.id,
      type: 'review_like',
      commentId: comment.id,
    });
    return { comment: toPublicComment(comment), liked: true };
  }
  user.likes.splice(index, 1);
  comment.likes = Math.max(0, comment.likes - 1);     
  removeReactionNotification('review_like', comment.id, user.id);
  return { comment: toPublicComment(comment), liked: false };
}

export async function mockRepostComment(
  commentId,
  userId
) {
  await wait();

  const comment = mockComments.find(
    (comment) => comment.id === commentId
  );

  const user = mockUsers.find(
    (user) => user.id === userId
  );

  if (!comment) {
    throw new Error('Reseña no encontrada');
  }

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const repostIndex = user.reposts.indexOf(commentId);

  if (repostIndex === -1) {
    // It was not reposted, so add it
    user.reposts.push(commentId);
    comment.reposts += 1;
    createNotification({
      recipientId: comment.authorId,
      actorId: user.id,
      type: 'review_repost',
      commentId: comment.id,
    });

    return {
      comment: toPublicComment(comment),
      reposted: true,
    };
  }

  // It was already reposted, so remove it
  user.reposts.splice(repostIndex, 1);
  comment.reposts = Math.max(0, comment.reposts - 1);
  removeReactionNotification('review_repost', comment.id, user.id);

  return {
    comment: toPublicComment(comment),
    reposted: false,
  };
}

export async function mockGetPopularReviews() {
  await wait();
  return [...mockComments]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 10)
    .map(toPublicComment);
}

export async function mockGetFriendReviews(userId) {
  await wait();
  const numericUserId = Number(userId);
  const friendIds = new Set(
    mockFriendships
      .filter(
        (friendship) =>
          friendship.status === 'accepted' &&
          (friendship.fromId === numericUserId || friendship.toId === numericUserId)
      )
      .map((friendship) =>
        friendship.fromId === numericUserId ? friendship.toId : friendship.fromId
      )
  );

  return mockComments
    .filter((comment) => friendIds.has(comment.authorId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
    .map(toPublicComment);
}

export async function mockGetAllUsers() {
  await wait();
  return mockUsers.map(toPublicUser);
}

export async function mockUpdateUserRole(userId, role) {
  await wait();
  const user = mockUsers.find((u) => u.id === userId);
  if (!user) throw new Error('Usuario no encontrado');
  user.role = role;
  return toPublicUser(user);
}

export function mockGetUser(userId) {
  return mockUsers.find((u) => u.id === userId);
}

//Carga los reposts del usuario y devuelve los comentarios asociados por el commentId
export async function mockGetUserReposts(userId) {
  await wait();
  const user = mockGetUser(userId);
  if (!user) throw new Error('Usuario no encontrado');

  return user.reposts
    .map((commentId) => mockComments.find((c) => c.id === commentId))
    .filter(Boolean) // Filtramos los comentarios que no exiten y aparecen como undefined
    .map((comment) => toPublicComment(comment));
}

type AchievementStat = 'totalReviews' | 'maxLikesOnReview' | 'distinctGenres' | 'totalRatings' | 'totalPhotos';

interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  stat: AchievementStat;
  goal: number;
  points: number;
}

const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_review',
    title: 'Primera reseña',
    description: 'Publicá tu primera reseña',
    icon: 'create-outline',
    stat: 'totalReviews',
    goal: 1,
    points: 10,
  },
  {
    id: 'active_critic',
    title: 'Crítico en marcha',
    description: 'Publicá 5 reseñas',
    icon: 'chatbubbles-outline',
    stat: 'totalReviews',
     goal: 5,
    points: 20,
  },
  {
    id: 'expert_critic',
    title: 'Crítico experto',
    description: 'Publicá 15 reseñas',
    icon: 'ribbon-outline',
    stat: 'totalReviews',
    goal: 15,
    points: 30,
  },
  {
    id: 'viral_review',
    title: 'Reseña viral',
    description: 'Conseguí 100 likes o más en una sola reseña',
    icon: 'flame-outline',
    stat: 'maxLikesOnReview',
    goal: 100,
    points: 50,
  },
  {
    id: 'genre_explorer',
    title: 'Explorador de géneros',
    description: 'Reseñá películas de 3 géneros distintos',
    icon: 'compass-outline',
    stat: 'distinctGenres',
    goal: 3,
    points: 10,
  },
  {
    id: 'star_rater',
    title: 'Todo estrellas',
    description: 'Calificá con estrellas 5 películas',
    icon: 'star-outline',
    stat: 'totalRatings',
    goal: 5,
    points: 15,
  },
  { id: 'cinema_photo', title: 'Fui al cine', description: 'Subí una reseña con foto', icon: 'camera-outline', stat: 'totalPhotos', goal: 1, points: 20 },
];

export const REWARDS = [
  { id: 'popcorn', title: 'Pochoclos medianos', description: 'En cines adheridos', icon: 'fast-food-outline', cost: 30 },
  { id: 'two_for_one', title: '2x1 en entradas', description: 'Válido de lunes a jueves', icon: 'ticket-outline', cost: 60 },
  { id: 'presale', title: 'Preventa anticipada', description: 'Acceso 24 h antes a preventas', icon: 'time-outline', cost: 100 },
  { id: 'free_ticket', title: 'Entrada gratis', description: 'Una función 2D a elección', icon: 'film-outline', cost: 150 },
];

export async function mockGetAchievements(userId) {
  await wait();
  const comments = mockComments
    .filter((c) => c.authorId === userId)
    .map((c) => ({ ...c, movie: mockMovies.find((m) => m.id === c.movieId) }));
  const genres = new Set(comments.flatMap((comment) => comment.movie?.genres ?? []));
  const stats: Record<AchievementStat, number> = {
    totalReviews: comments.length,
    maxLikesOnReview: comments.reduce((max, c) => Math.max(max, c.likes), 0),
    distinctGenres: genres.size,
    totalRatings: comments.filter((c) => c.rating !== null).length,
    totalPhotos: comments.filter((c) => c.photo).length,
  };
  const list = ACHIEVEMENTS.map((a) => {
    const current = Math.min(stats[a.stat], a.goal);
    return {
      id: a.id, title: a.title, description: a.description, icon: a.icon,
      points: a.points, goal: a.goal, current, unlocked: current >= a.goal,
    };
  });
  const totalPoints = list.filter((a) => a.unlocked).reduce((sum, a) => sum + a.points, 0);
  const profile = {
    reviews: stats.totalReviews,
    likes: comments.reduce((sum, c) => sum + c.likes, 0),
  };
  return { list, totalPoints, profile };
}


let mockFriendships = [
  { id: 1, fromId: 2, toId: 1, status: 'pending', createdAt: new Date().toISOString() },  
  { id: 2, fromId: 3, toId: 4, status: 'accepted', createdAt: new Date().toISOString() }, 
];
let nextFriendshipId = mockFriendships.length + 1;

type NotificationType = 'friend_request' | 'review_like' | 'review_repost';

type MockNotification = {
  id: number;
  recipientId: number;
  actorId: number;
  type: NotificationType;
  friendshipId?: number;
  commentId?: number;
  createdAt: string;
  read: boolean;
};

let mockNotifications: MockNotification[] = [
  {
    id: 1,
    recipientId: 1,
    actorId: 2,
    type: 'friend_request',
    friendshipId: 1,
    createdAt: mockFriendships[0].createdAt,
    read: false,
  },
];
let nextNotificationId = mockNotifications.length + 1;

function createNotification(data: Omit<MockNotification, 'id' | 'createdAt' | 'read'>) {
  if (data.recipientId === data.actorId) return;

  const duplicate = mockNotifications.some(
    (notification) =>
      notification.recipientId === data.recipientId &&
      notification.actorId === data.actorId &&
      notification.type === data.type &&
      notification.commentId === data.commentId &&
      notification.friendshipId === data.friendshipId
  );
  if (duplicate) return;

  mockNotifications.push({
    id: nextNotificationId++,
    ...data,
    createdAt: new Date().toISOString(),
    read: false,
  });
}

function removeReactionNotification(type: NotificationType, commentId: number, actorId: number) {
  mockNotifications = mockNotifications.filter(
    (notification) =>
      !(
        notification.type === type &&
        notification.commentId === commentId &&
        notification.actorId === actorId
      )
  );
}

function toPublicNotification(notification: MockNotification) {
  const comment = notification.commentId
    ? mockComments.find((item) => item.id === notification.commentId)
    : undefined;
  const movie = comment
    ? mockMovies.find((item) => item.id === comment.movieId)
    : undefined;

  return {
    id: notification.id,
    type: notification.type,
    read: notification.read,
    createdAt: notification.createdAt,
    actor: toUserSummary(notification.actorId),
    commentId: notification.commentId ?? null,
    movie: movie ? { id: movie.id, title: movie.title } : null,
  };
}


function findFriendship(a, b) {
  return mockFriendships.find(
    (f) => (f.fromId === a && f.toId === b) || (f.fromId === b && f.toId === a)
  );
}

function toUserSummary(userId) {
  const u = mockUsers.find((x) => x.id === userId);
  return u ? { id: u.id, name: u.name, role: u.role } : { id: userId, name: 'Usuario', role: 'user' };
}

export async function mockGetFriendshipStatus(meId, otherId) {
  await wait();
  const f = findFriendship(meId, otherId);
  if (!f) return { status: 'none' };
  if (f.status === 'accepted') return { status: 'friends', requestId: f.id };
  return { status: f.fromId === meId ? 'sent' : 'received', requestId: f.id };
}

export async function mockSendFriendRequest(fromId, toId) {
  await wait();
  if (fromId === toId) throw new Error('No podés agregarte a vos mismo');
  if (findFriendship(fromId, toId)) throw new Error('Ya hay una solicitud o ya son amigos');
  const request = { id: nextFriendshipId++, fromId, toId, status: 'pending', createdAt: new Date().toISOString() };
  mockFriendships.push(request);
  createNotification({
    recipientId: toId,
    actorId: fromId,
    type: 'friend_request',
    friendshipId: request.id,
  });
  return request;
}


export async function mockRespondFriendRequest(requestId, accept) {
  await wait();
  const request = mockFriendships.find((f) => f.id === requestId);
  if (!request || request.status !== 'pending') throw new Error('La solicitud ya no existe');
  const notification = mockNotifications.find(
    (item) => item.type === 'friend_request' && item.friendshipId === requestId
  );
  if (notification) notification.read = true;
  if (accept) request.status = 'accepted';
  else mockFriendships = mockFriendships.filter((f) => f.id !== requestId);
}


export async function mockRemoveFriendship(requestId) {
  await wait();
  const friendship = mockFriendships.find((item) => item.id === requestId);
  mockFriendships = mockFriendships.filter((f) => f.id !== requestId);
  if (friendship?.status === 'pending') {
    mockNotifications = mockNotifications.filter(
      (notification) => notification.friendshipId !== requestId
    );
  }
}

export async function mockGetNotifications(userId) {
  await wait();
  return mockNotifications
    .filter((notification) => notification.recipientId === Number(userId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(toPublicNotification);
}

export async function mockMarkNotificationRead(notificationId, userId) {
  await wait();
  const notification = mockNotifications.find(
    (item) => item.id === notificationId && item.recipientId === Number(userId)
  );
  if (!notification) throw new Error('Notificación no encontrada');
  notification.read = true;
  return toPublicNotification(notification);
}

export async function mockMarkAllNotificationsRead(userId) {
  await wait();
  mockNotifications.forEach((notification) => {
    if (notification.recipientId === Number(userId)) notification.read = true;
  });
}


export async function mockGetPendingRequests(userId) {
  await wait();
  return mockFriendships
    .filter((f) => f.toId === userId && f.status === 'pending')
    .map((f) => ({ id: f.id, from: toUserSummary(f.fromId), createdAt: f.createdAt }));
}

export async function mockGetFriends(userId) {
  await wait();
  return mockFriendships
    .filter((f) => f.status === 'accepted' && (f.fromId === userId || f.toId === userId))
    .map((f) => ({ requestId: f.id, ...toUserSummary(f.fromId === userId ? f.toId : f.fromId) }));
}


export async function mockGetPublicProfile(userId) {
  const user = mockUsers.find((u) => u.id === userId);
  if (!user) throw new Error('Usuario no encontrado');

  
  const [achievements, reposts] = await Promise.all([
    mockGetAchievements(userId),   
    mockGetUserReposts(userId),    
  ]);

  const comments = mockComments
    .filter((c) => c.authorId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(toPublicComment);         

  const friends = mockFriendships.filter(
    (f) => f.status === 'accepted' && (f.fromId === userId || f.toId === userId)
  ).length;

  return {
    user: { id: user.id, name: user.name, role: user.role },  
    rank: calculateRank(comments.length),
    comments,
    reposts,
    stats: {
      comments: comments.length,
      reposts: reposts.length,
      likesReceived: achievements.profile.likes,
      points: achievements.totalPoints,
      friends,
    },
  };
}
