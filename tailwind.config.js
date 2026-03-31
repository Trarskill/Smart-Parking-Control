tailwind.config = {
    theme: {
        extend: {
            colors: {
                graphite: {
                    'very-light': '#F2F2F2',
                    'light': '#D9D9D9',
                    DEFAULT: '#B9B9B9', // Базовий Graphite
                    'dark': '#7A7A7A',
                    'dark-blue': '#16161E',
                },
                white: {
                    DEFAULT: '#FFFFFF',
                },
                mint: {
                    'very-light': '#E8F9EB',
                    'light': '#CFF4D4',
                    DEFAULT: '#ADEBB3', // Базовий Mint
                    'dark': '#76C47E',
                    'very-dark': '#3D7A43',
                }
            },
            fontFamily: {
                sans: ['Poppins', 'sans-serif'],
            },
            fontSize: {
                'h1': ['24px', 'normal'],       // Для головних заголовків
                'h2': ['18px', 'normal'],       // Для підзаголовків та меню
                'body': ['14px', 'normal'],     // Для звичайного тексту
                'log-title': ['14px', 'normal'], // Для заголовків таблиці
                'pagination': ['12px', '1'],    // Для кнопок сторінок (12px, 100%)
                'item-text': ['11px', { 
                    lineHeight: '1.24',
                    letterSpacing: '0em'
                }],// Для підписів у віджетах (11px, 124%)
                'item-numbers': ['32px', { 
                    lineHeight: 'normal',
                    letterSpacing: '-0.01em' 
                }],// Для великих цифр у віджетах
            }
        }
    }
}