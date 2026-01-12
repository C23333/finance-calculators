// Site-wide initialization
(function() {
    // Force HTTPS
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        location.replace('https:' + location.href.substring(location.protocol.length));
    }

    // Dynamically add favicon if not present
    if (!document.querySelector('link[rel="icon"]')) {
        const favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.type = 'image/svg+xml';
        favicon.href = '/favicon.svg';
        document.head.appendChild(favicon);
    }

    // Add Google AdSense script if not present
    if (!document.querySelector('script[src*="adsbygoogle"]')) {
        const adsense = document.createElement('script');
        adsense.async = true;
        adsense.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9483557811977052';
        adsense.crossOrigin = 'anonymous';
        document.head.appendChild(adsense);
    }

    // Add Google Analytics 4 if not present
    if (!document.querySelector('script[src*="googletagmanager"]')) {
        const ga = document.createElement('script');
        ga.async = true;
        ga.src = 'https://www.googletagmanager.com/gtag/js?id=G-QFTQMV9QP7';
        document.head.appendChild(ga);

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', 'G-QFTQMV9QP7');
    }
})();
