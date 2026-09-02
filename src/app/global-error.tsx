'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const description = error.digest
    ? `Код ошибки: ${error.digest}. Попробуйте повторить действие.`
    : 'Попробуйте повторить действие. Если ошибка повторится, сообщите нам об этом.';

  return (
    <html lang="ru">
      <head>
        <title>Monetikum — Ошибка</title>
      </head>
      <body
        style={{
          margin: 0,
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center', padding: '0 16px' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Что-то пошло не так</h1>
          <p style={{ color: '#6b7280', marginBottom: 16 }}>{description}</p>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: '8px 20px',
              fontSize: '1rem',
              border: 'none',
              borderRadius: 4,
              backgroundColor: '#228be6',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Повторить
          </button>
        </div>
      </body>
    </html>
  );
}
