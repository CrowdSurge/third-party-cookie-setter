/**
 * 
 * 
 * 
 * @returns {csThirdPartyCookie.Anonym$0}
 */
var csThirdPartyCookie = function () {
    'use strict';

    /**
     * config optioins
     */
    var options = {
        thirdPartyCookieName: 'cs_third_party_accept',
        returnUriParameter: 'cookieAttempted',
        pathToCookieSetter: '/third-party-cookie-setter/example/third_party_cookie_setter.html',
        returnUriKey: 'return_url'
    };


    // http://stackoverflow.com/questions/11582512/how-to-get-url-parameters-with-javascript
    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || ["", ""])[1].replace(/\+/g, '%20')) || null;
    }

    function setCookie() {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + 2);
        document.cookie = options.thirdPartyCookieName + "=1;expires=" + exdate.toUTCString();
    }

    function isCookieSet() {
        return (document.cookie.indexOf(options.thirdPartyCookieName) > -1);
    }

    function isReturnedFromRedirect() {
        var re = new RegExp("[?|&]" + options.returnUriParameter + "=1", "i");
        return (document.referrer.search(re) > 0);
    }

    function unableToSetCookie() {
        console.log('Cookies must be enabled');
        return false;
    }

    /**
     *
     * redirect to cookie setter in top
     * pass the top url as a uri parameter
     *
     * console.log(window.location.protocol);
     */
    function redirectToSetCookie() {
        window.top.location.href = "//" + window.location.host + options.pathToCookieSetter +  "?" + options.returnUriKey + "=" + encodeURIComponent(document.referrer);
        console.log('redirecting');
    }

    // not in frame so third party cookie bug not an issue
    function inFrame() {
        return (window.top !== window.self);
    }

    function returnToParent() {
        var returnUrl = getURLParameter(options.returnUriKey);
        returnUrl += (returnUrl.split('?')[1] ? '&' : '?') + options.returnUriParameter + '=1';
        window.location.href = returnUrl;
    }

    function publicCheck() {
        if (!inFrame()) {
            return true;
        }

        if (isCookieSet()) {
            return true;
        }

        if (isReturnedFromRedirect()) {
            return unableToSetCookie();
        }

        setCookie();

        if (isCookieSet()) {
            return true;
        }

        redirectToSetCookie();
    }

    function setAndReturn() {
        setCookie();
        returnToParent();
    }

    return {
        check: publicCheck,
        setAndReturn: setAndReturn
    };

};
