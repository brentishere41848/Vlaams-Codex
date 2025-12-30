(function() {
    'use strict';

    const translations = {
        en: {
            features: 'Features',
            install: 'Install',
            docs: 'Docs',
            learn: 'Learn',
            playground: 'Playground',
            ai: 'AI',
            examples: 'Examples',
            community: 'Community',
            getStarted: 'Get Started',
            heroDescription: 'A programming language with Flemish dialect keywords that compiles to Python. Write in West-Vlaams, Antwerps, Limburgs, and more — then run it seamlessly.',
            tagline: "'t Es simpel, 't es plansen, 't es Vlaams!",
            dialects: 'Dialects',
            commands: 'Commands',
            free: 'Free',
            whyVlaamsCodex: 'Why Vlaams Codex?',
            whyVlaamsCodexSubtitle: 'Experience programming in your native Flemish dialect with powerful features',
            multiVlaamsDialects: 'Multi-Vlaams Dialects',
            multiVlaamsDescription: 'Write code in 7 Flemish dialects with 80+ command aliases. West-Vlaams, Antwerps, Limburgs, Brussels, Genks, and more!',
            exploreDialects: 'Explore Dialects →',
            magicMode: 'Magic Mode',
            magicModeDescription: 'Run .plats files directly with Python using custom encoding. No compilation step needed - it just works!',
            learnHow: 'Learn How →',
            interactiveRepl: 'Interactive REPL',
            interactiveReplDescription: 'Try Platskript in real-time with interactive REPL. Test your code instantly with live feedback.',
            startRepl: 'Start REPL →',
            pythonIntegration: 'Python Integration',
            pythonIntegrationDescription: 'Seamless transpilation to Python. Use any Python library and framework with Platskript syntax.',
            viewSpec: 'View Spec →',
            vscodeExtension: 'VS Code Extension',
            vscodeExtensionDescription: 'Full syntax highlighting, IntelliSense, and code snippets for best development experience.',
            installExtension: 'Install Extension →',
            easyInstallation: 'Easy Installation',
            easyInstallationDescription: 'One-line installation with pip. Supports pipx for isolated environments and development mode for contributors.',
            installNow: 'Install Now →',
            startLearning: 'Start Learning',
            quickStart: 'Quick Start',
            quickStartSubtitle: 'Get started with Vlaams Codex in seconds',
            runFirstProgram: 'Run Your First Program',
            orUseMagicMode: 'Or Use Magic Mode',
            installationOptions: 'Installation Options',
            recommended: 'Recommended',
            perfectForEndUsers: 'Perfect for end users. Keeps dependencies isolated.',
            standardInstallation: 'Standard installation. Works with existing Python setup.',
            forContributors: 'For contributors. Includes test suite and development tools.',
            npmInstallDescription: 'Install for Node.js projects. Available now!',
            multiVlaamsCommands: 'Multi-Vlaams Dialect Commands',
            multiVlaamsSubtitle: 'Every command works in 7 Flemish dialects! Use whichever feels most natural.',
            viewAllDialects: 'View All Dialects →',
            exploreExamples: 'Explore Examples',
            exploreExamplesSubtitle: 'Learn by doing with ready-to-run examples',
            viewAllExamples: 'View All Examples →',
            joinCommunity: 'Join Community',
            joinCommunitySubtitle: 'Connect with other Vlaams Codex developers',
            github: 'Star the repository, report issues, and contribute code',
            issueTracker: 'Report bugs, request features, and discuss improvements',
            contributing: 'Submit pull requests and help improve Vlaams Codex',
            twitter: 'Follow updates and join the conversation',
            documentation: 'Documentation',
            resources: 'Resources',
            playgroundHint: 'Play your first Platskript code in the browser!',
            playgroundEditorTitle: 'Code Editor',
            playgroundRun: 'Run Code',
            playgroundCopy: 'Copy',
            playgroundClear: 'Clear Output',
            playgroundOutputTitle: 'Output',
            playgroundOutputBadge: 'Live Preview',
            playgroundEmptyOutput: 'Output will appear here...'
        },
        vl: {
            features: 'Kenmerken',
            install: 'Installeren',
            docs: 'Docs',
            learn: 'Leren',
            playground: 'Speelterrein',
            ai: 'AI',
            examples: 'Voorbeelden',
            community: 'Community',
            getStarted: 'Start nu',
            heroDescription: "Een programmeertaal met Vlaamse dialect-keywords die compileert naar Python. Schrijf in West-Vlaams, Antwerps, Limburgs en meer — en voer ’t direct uit.",
            tagline: "'t Es simpel, 't es plansen, 't es Vlaams!",
            dialects: 'Dialecten',
            commands: 'Commando’s',
            free: 'Gratis',
            whyVlaamsCodex: 'Waarom Vlaams Codex?',
            whyVlaamsCodexSubtitle: 'Programmeer in uw eigen Vlaamse dialect met krachtige features',
            multiVlaamsDialects: 'Multi-Vlaams dialecten',
            multiVlaamsDescription: 'Schrijf code in 7 Vlaamse dialecten met 80+ commando-aliassen: West-Vlaams, Antwerps, Limburgs, Brussels, Genks en meer.',
            exploreDialects: 'Verken dialecten →',
            magicMode: 'Magic Mode',
            magicModeDescription: 'Voer .plats-bestanden rechtstreeks uit met Python via custom encoding. Geen compilatie nodig — ’t werkt gewoon.',
            learnHow: 'Leer hoe →',
            interactiveRepl: 'Interactieve REPL',
            interactiveReplDescription: 'Probeer Platskript live met een interactieve REPL. Test uw code direct met feedback.',
            startRepl: 'Start REPL →',
            pythonIntegration: 'Python-integratie',
            pythonIntegrationDescription: 'Naadloze transpillatie naar Python. Gebruik elke Python-bibliotheek en elk framework met Platskript-syntax.',
            viewSpec: 'Bekijk spec →',
            vscodeExtension: 'VS Code-extensie',
            vscodeExtensionDescription: 'Volledige syntax highlighting, IntelliSense en snippets voor de beste developer experience.',
            installExtension: 'Installeer extensie →',
            easyInstallation: 'Makkelijke installatie',
            easyInstallationDescription: 'Installatie met één regel via pip. Ondersteunt pipx voor geïsoleerde omgevingen en development mode voor bijdragers.',
            installNow: 'Installeer nu →',
            startLearning: 'Begin te leren',
            quickStart: 'Snelstart',
            quickStartSubtitle: 'Begin in seconden met Vlaams Codex',
            runFirstProgram: 'Voer uw eerste programma uit',
            orUseMagicMode: 'Of gebruik Magic Mode',
            installationOptions: 'Installatie-opties',
            recommended: 'Aanbevolen',
            perfectForEndUsers: 'Perfect voor eindgebruikers. Houdt afhankelijkheden netjes geïsoleerd.',
            standardInstallation: 'Standaardinstallatie. Werkt met een bestaande Python-setup.',
            forContributors: 'Voor bijdragers. Inclusief testsuite en ontwikkeltools.',
            npmInstallDescription: 'Installeren voor Node.js-projecten. Nu beschikbaar!',
            multiVlaamsCommands: 'Multi-Vlaams dialectcommando’s',
            multiVlaamsSubtitle: 'Elk commando werkt in 7 Vlaamse dialecten. Gebruik wat het beste aanvoelt.',
            viewAllDialects: 'Bekijk alle dialecten →',
            exploreExamples: 'Verken voorbeelden',
            exploreExamplesSubtitle: 'Leer door te doen met kant-en-klare voorbeelden',
            viewAllExamples: 'Bekijk alle voorbeelden →',
            joinCommunity: 'Sluit aan',
            joinCommunitySubtitle: 'Verbind met andere Vlaams Codex developers',
            github: 'Geef de repo een ster, meld issues en draag code bij',
            issueTracker: 'Meld bugs, vraag features aan en bespreek verbeteringen',
            contributing: 'Dien pull requests in en help Vlaams Codex verbeteren',
            twitter: 'Volg de updates en babbel mee',
            documentation: 'Documentatie',
            resources: 'Bronnen',
            playgroundHint: 'Probeer uw eerste Platskript-code in de browser!',
            playgroundEditorTitle: 'Code editor',
            playgroundRun: 'Run code',
            playgroundCopy: 'Kopieer',
            playgroundClear: 'Wis output',
            playgroundOutputTitle: 'Output',
            playgroundOutputBadge: 'Live preview',
            playgroundEmptyOutput: 'Output komt hier te staan...'
        }
    };

    let currentLanguage = 'en';

    function initLanguageSwitcher() {
        const languageSelect = document.getElementById('languageSelect');
        if (!languageSelect) return;

        const savedLanguage = localStorage.getItem('language') || 'en';
        const urlParams = new URLSearchParams(window.location.search);
        const urlLanguage = urlParams.get('lang');

        if (urlLanguage && translations[urlLanguage]) {
            currentLanguage = urlLanguage;
        } else {
            currentLanguage = savedLanguage;
        }

        languageSelect.value = currentLanguage;
        applyLanguage(currentLanguage);

        languageSelect.addEventListener('change', function() {
            const newLanguage = this.value;
            currentLanguage = newLanguage;
            localStorage.setItem('language', newLanguage);
            applyLanguage(newLanguage);
        });
    }

    function applyLanguage(language) {
        const trans = translations[language];

        function applyLanguageBlocks() {
            document.querySelectorAll('[data-lang-block]').forEach(element => {
                const raw = element.getAttribute('data-lang-block') || '';
                const langs = raw.split(/[\s,]+/).filter(Boolean);
                if (!langs.length) return;

                const show = langs.includes(language);
                if (show) {
                    element.removeAttribute('hidden');
                } else {
                    element.setAttribute('hidden', '');
                }
            });
        }

        if (window.VlaamsCodex && window.VlaamsCodex.showLoadingScreen) {
            window.VlaamsCodex.showLoadingScreen(() => {
                document.querySelectorAll('[data-lang]').forEach(element => {
                    const key = element.getAttribute('data-lang');
                    if (Object.prototype.hasOwnProperty.call(trans, key)) {
                        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                            element.placeholder = trans[key];
                        } else {
                            element.textContent = trans[key];
                        }
                    } else if (key) {
                        console.warn(`[i18n] Missing key "${key}" for language "${language}"`);
                    }
                });

                document.querySelectorAll('[data-lang-placeholder]').forEach(element => {
                    const key = element.getAttribute('data-lang-placeholder');
                    if (Object.prototype.hasOwnProperty.call(trans, key)) {
                        element.setAttribute('placeholder', trans[key]);
                    } else if (key) {
                        console.warn(`[i18n] Missing placeholder key "${key}" for language "${language}"`);
                    }
                });

                applyLanguageBlocks();

                document.documentElement.lang = language === 'vl' ? 'nl' : 'en';

                const urlParams = new URLSearchParams(window.location.search);
                urlParams.set('lang', language);
                const newUrl = window.location.pathname + '?' + urlParams.toString();
                window.history.replaceState({}, '', newUrl);
            });
        } else {
            document.querySelectorAll('[data-lang]').forEach(element => {
                const key = element.getAttribute('data-lang');
                if (Object.prototype.hasOwnProperty.call(trans, key)) {
                    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                        element.placeholder = trans[key];
                    } else {
                        element.textContent = trans[key];
                    }
                } else if (key) {
                    console.warn(`[i18n] Missing key "${key}" for language "${language}"`);
                }
            });

            document.querySelectorAll('[data-lang-placeholder]').forEach(element => {
                const key = element.getAttribute('data-lang-placeholder');
                if (Object.prototype.hasOwnProperty.call(trans, key)) {
                    element.setAttribute('placeholder', trans[key]);
                } else if (key) {
                    console.warn(`[i18n] Missing placeholder key "${key}" for language "${language}"`);
                }
            });

            applyLanguageBlocks();

            document.documentElement.lang = language === 'vl' ? 'nl' : 'en';

            const urlParams = new URLSearchParams(window.location.search);
            urlParams.set('lang', language);
            const newUrl = window.location.pathname + '?' + urlParams.toString();
            window.history.replaceState({}, '', newUrl);
        }
    }

    function switchLanguage(language) {
        if (!translations[language]) {
            console.warn(`Language ${language} not available`);
            return;
        }

        currentLanguage = language;
        localStorage.setItem('language', language);
        applyLanguage(language);

        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.value = language;
        }
    }

    function getCurrentLanguage() {
        return currentLanguage;
    }

    function translate(key) {
        return translations[currentLanguage][key] || key;
    }

    function addTranslation(key, translationsDict) {
        if (translations.en[key]) {
            console.warn(`Translation key ${key} already exists`);
            return;
        }

        translations.en[key] = translationsDict.en || key;
        translations.vl[key] = translationsDict.vl || translationsDict.en || key;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            initLanguageSwitcher,
            switchLanguage,
            getCurrentLanguage,
            translate,
            addTranslation
        };
    } else {
        window.LanguageSwitcher = {
            initLanguageSwitcher,
            switchLanguage,
            getCurrentLanguage,
            translate,
            addTranslation
        };
    }

    document.addEventListener('DOMContentLoaded', function() {
        if (window.LanguageSwitcher) {
            window.LanguageSwitcher.initLanguageSwitcher();
        }
    });

})();
