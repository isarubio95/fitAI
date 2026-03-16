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

UPDATE tipo_ejercicio
SET gif_url = REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      REPLACE(
                        REPLACE(
                          REPLACE(
                            REPLACE(
                              REPLACE(
                                REPLACE(gif_url,
                                  'á', 'a'
                                ),
                                  'é', 'e'
                                ),
                                  'í', 'i'
                                ),
                                  'ó', 'o'
                                ),
                                  'ú', 'u'
                                ),
                                  'Á', 'A'
                                ),
                                  'É', 'E'
                                ),
                                  'Í', 'I'
                                ),
                                  'Ó', 'O'
                                ),
                                  'Ú', 'U'
                                );