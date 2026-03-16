UPDATE tipo_ejercicio
SET gif_url = CONCAT(
  '/ejercicios/',
  REPLACE(
    LOWER(
      -- quitamos la parte entre paréntesis (y posibles espacios antes)
      REGEXP_REPLACE(nombre, '\\s*\\(.*\\)', '')
    ),
    ' ',
    '-'
  ),
  '.gif'
);