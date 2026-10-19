// Une nombres de clases CSS ignorando los vacíos: cx('a', falso && 'b', 'c') -> 'a c'
export const cx = (...clases) => clases.filter(Boolean).join(' ');
