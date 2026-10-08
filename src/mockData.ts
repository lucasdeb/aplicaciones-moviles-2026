function wait(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mockUsers = [
  { id: 1, name: 'Admin WhatNext', email: 'admin.demo@whatsnext.app', role: 'superadmin', password: 'Demo1234' },
  { id: 2, name: 'Sofía Ramírez',   email: 'sofia.demo@whatsnext.app', role: 'moderator',  password: 'Demo1234' },
  { id: 3, name: 'Mateo Duarte',    email: 'mateo.demo@whatsnext.app', role: 'user',       password: 'Demo1234' },
  { id: 4, name: 'Lucía Fernández', email: 'lucia.demo@whatsnext.app', role: 'user',       password: 'Demo1234' },
  { id: 5, name: 'Nicolás Peralta', email: 'nicolas.demo@whatsnext.app', role: 'user',     password: 'Demo1234' },
];

let nextUserId = mockUsers.length + 1;

function poster(title, bg, fg) {
  const text = encodeURIComponent(title);
  return `https://placehold.co/400x600/${bg}/${fg}?text=${text}&font=roboto`;
}

const mockMovies = [
  {
    id: 1,
    title: 'El Último Horizonte',
    overview:
      'Un piloto retirado debe volver a los mandos para una misión de rescate que lo obliga a enfrentar su propio pasado.',
    year: 2023,
    genre: 'Acción',
    rating: 4.2,
    posterUrl: poster('El Último Horizonte', '1c2228', 'ff8000'),
    backdropUrl: null,
    views: 812340,
    featured: false,
  },
  {
    id: 2,
    title: 'Código Rojo',
    overview:
      'Un grupo de hackers descubre una conspiración que amenaza con colapsar la red eléctrica de toda una ciudad.',
    year: 2022,
    genre: 'Acción',
    rating: 3.9,
    posterUrl: poster('Código Rojo', '1c2228', 'ff8000'),
    backdropUrl: null,
    views: 634210,
    featured: false,
  },
  {
    id: 3,
    title: 'La Última Estación',
    overview:
      'Dos hermanos separados por años de silencio se reencuentran en un tren nocturno rumbo a despedir a su padre.',
    year: 2021,
    genre: 'Drama',
    rating: 4.5,
    posterUrl: poster('La Última Estación', '1c2228', '40bcf4'),
    backdropUrl: null,
    views: 921450,
    featured: true,
  },
  {
    id: 4,
    title: 'Cartas sin Enviar',
    overview:
      'Una escritora encuentra las cartas que nunca envió su abuela y reconstruye una historia de amor olvidada.',
    year: 2020,
    genre: 'Drama',
    rating: 4.1,
    posterUrl: poster('Cartas sin Enviar', '1c2228', '40bcf4'),
    backdropUrl: null,
    views: 545300,
    featured: false,
  },
  {
    id: 5,
    title: 'Vecinos Ruidosos',
    overview:
      'Una pareja intenta sobrevivir a su primer año de casados mientras lidian con los vecinos más caóticos del barrio.',
    year: 2023,
    genre: 'Comedia',
    rating: 3.7,
    posterUrl: poster('Vecinos Ruidosos', '1c2228', 'ffd166'),
    backdropUrl: null,
    views: 402110,
    featured: false,
  },
  {
    id: 6,
    title: 'Reunión de Ex',
    overview:
      'Cinco amigos de la secundaria organizan una reunión que se sale de control apenas veinte minutos después de empezar.',
    year: 2019,
    genre: 'Comedia',
    rating: 3.5,
    posterUrl: poster('Reunión de Ex', '1c2228', 'ffd166'),
    backdropUrl: null,
    views: 318900,
    featured: false,
  },
  {
    id: 7,
    title: 'Órbita Cero',
    overview:
      'La tripulación de una estación espacial debe decidir quién regresa a la Tierra cuando los recursos empiezan a escasear.',
    year: 2024,
    genre: 'Ciencia Ficción',
    rating: 4.6,
    posterUrl: poster('Órbita Cero', '1c2228', '00e054'),
    backdropUrl: null,
    views: 1034200,
    featured: true,
  },
  {
    id: 8,
    title: 'Sintéticos',
    overview:
      'En una ciudad donde los androides conviven con humanos, un detective investiga el primer crimen cometido por una IA.',
    year: 2022,
    genre: 'Ciencia Ficción',
    rating: 4.3,
    posterUrl: poster('Sintéticos', '1c2228', '00e054'),
    backdropUrl: null,
    views: 789600,
    featured: true,
  },
  {
    id: 9,
    title: 'La Casa del Fondo',
    overview:
      'Una familia se muda a una casa antigua y empieza a notar que algo dentro de las paredes los está observando.',
    year: 2023,
    genre: 'Terror',
    rating: 3.8,
    posterUrl: poster('La Casa del Fondo', '1c2228', 'ff4d4d'),
    backdropUrl: null,
    views: 456700,
    featured: false,
  },
  {
    id: 10,
    title: 'Medianoche en el Bosque',
    overview:
      'Un grupo de excursionistas se pierde en un bosque donde las leyendas locales resultan ser más reales de lo que creían.',
    year: 2021,
    genre: 'Terror',
    rating: 3.6,
    posterUrl: poster('Medianoche en el Bosque', '1c2228', 'ff4d4d'),
    backdropUrl: null,
    views: 389400,
    featured: false,
  },
  {
    id: 11,
    title: 'Corazón de Neón',
    overview:
      'En una ciudad futurista, una cantante underground lucha por mantener viva su música frente a las grandes discográficas.',
    year: 2024,
    genre: 'Drama',
    rating: 4.0,
    posterUrl: poster('Corazón de Neón', '1c2228', '40bcf4'),
    backdropUrl: null,
    views: 512800,
    featured: false,
  },
  {
    id: 12,
    title: 'Persecución Final',
    overview:
      'Un expolicía debe atravesar medio país en 24 horas para entregar evidencia clave antes de que sea destruida.',
    year: 2020,
    genre: 'Acción',
    rating: 3.8,
    posterUrl: poster('Persecución Final', '1c2228', 'ff8000'),
    backdropUrl: null,
    views: 467300,
    featured: false,
  },
  {
    id: 13,
    title: 'Batman',
    overview:
      'Un vigilante enmascarado protege Ciudad Gótica de la corrupción y el crimen que consumieron a su familia.',
    year: 2022,
    genre: 'Acción',
    rating: 4.7,
    posterUrl: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=500&q=60',
    backdropUrl: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=1200&q=60',
    views: 1284900,
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
    const hasRating = templateIndex % 4 !== 0;
    mockComments.push({
      id: nextCommentId++,
      text: commentTemplates[templateIndex % commentTemplates.length],
      rating: hasRating ? Math.round((2 + ((templateIndex * 37) % 6)) * 2) / 2 : null,
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
    photo: comment.photo ?? null,
    author: author ? { id: author.id, name: author.name } : null,
    movie: movie ? { id: movie.id, title: movie.title, year: movie.year, posterUrl: movie.posterUrl } : undefined,
  };
}

function withCommentsCount(movie) {
  const commentsCount = mockComments.filter((c) => c.movieId === movie.id).length;
  return { ...movie, commentsCount };
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
  const user = { id: nextUserId++, name, email, role: 'user', password };
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


function toPublicUser({ password, ...user }: { id: number; name: string; email: string; role: string; password: string }) {
  return user;
}

export async function mockGetMovies() {
    await wait();
    return [...mockMovies].sort((a, b) => b.rating - a.rating).map(withCommentsCount);
  }


export async function mockGetMovie(id) {
  await wait();
  const movie = mockMovies.find((m) => m.id === id);
  if (!movie) return null;
  movie.views += 1;
  return movie;
}

export async function mockGetRecommendations(id) {
  await wait();
  const movie = mockMovies.find((m) => m.id === id);
  if (!movie) return [];
  return mockMovies
    .filter((m) => m.genre === movie.genre && m.id !== movie.id)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);
}

export async function mockCreateMovie(data) {
  await wait();
  const movie = {
    id: nextMovieId++,
    title: data.title,
    overview: data.overview,
    year: Number(data.year),
    genre: data.genre,
    rating: Number(data.rating),
    posterUrl: data.posterUrl || poster(data.title, '1c2228', '40bcf4'),
    backdropUrl: data.backdropUrl || null,
    views: 0,
    featured: Boolean(data.featured),
  };
  mockMovies.push(movie);
  return movie;
}

export async function mockUpdateMovie(id, data) {
  await wait();
  const movie = mockMovies.find((m) => m.id === id);
  if (!movie) throw new Error('Película no encontrada');
  Object.assign(movie, {
    ...(data.title !== undefined && { title: data.title }),
    ...(data.overview !== undefined && { overview: data.overview }),
    ...(data.year !== undefined && { year: Number(data.year) }),
    ...(data.genre !== undefined && { genre: data.genre }),
    ...(data.rating !== undefined && { rating: Number(data.rating) }),
    ...(data.posterUrl !== undefined && { posterUrl: data.posterUrl }),
    ...(data.backdropUrl !== undefined && { backdropUrl: data.backdropUrl }),
    ...(data.featured !== undefined && { featured: Boolean(data.featured) }),
  });
  return movie;
}

export async function mockDeleteMovie(id) {
  await wait();
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
  const comment = {
    id: nextCommentId++,
    text,
    rating: rating ?? null,
    likes: 0,
    reposts: 0,
    createdAt: new Date().toISOString(),
    authorId: Number(authorId),
    movieId,
    photo: photo ?? null,
  };
  mockComments.push(comment);
  return toPublicComment(comment);
}

export async function mockDeleteComment(commentId) {
  await wait();
  const index = mockComments.findIndex((c) => c.id === commentId);
  if (index !== -1) mockComments.splice(index, 1);
}

export async function mockLikeComment(commentId) {
  await wait();
  const comment = mockComments.find((c) => c.id === commentId);
  if (!comment) throw new Error('Comentario no encontrado');
  comment.likes += 1;
  return toPublicComment(comment);
}

export async function mockRepostComment(commentId) {
  await wait();
  const comment = mockComments.find((c) => c.id === commentId);
  if (!comment) throw new Error('Comentario no encontrado');
  comment.reposts += 1;
  return toPublicComment(comment);
}

export async function mockGetPopularReviews() {
  await wait();
  return [...mockComments]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 10)
    .map(toPublicComment);
}

export async function mockGetPopularReviewers() {
  await wait();
  const counts = new Map();
  for (const c of mockComments) counts.set(c.authorId, (counts.get(c.authorId) || 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([authorId, reviewCount]) => {
      const user = mockUsers.find((u) => u.id === authorId);
      return { id: authorId, name: user ? user.name : 'Usuario', reviewCount };
    });
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
    description: 'Publicá tu primer comentario o reseña',
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
  const genres = new Set(comments.map((c) => c.movie?.genre).filter(Boolean));
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
