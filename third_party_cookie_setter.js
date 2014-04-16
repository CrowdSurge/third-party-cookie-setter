/**
 *
 *
 *
 * @returns {csThirdPartyCookie.Anonym$0}
 */
var csThirdPartyCookie = function () {
    'use strict';

    /**
     * config options
     */
    var options = {
        thirdPartyCookieName: 'cs_third_party_accept',
        returnUriParameter: 'cookie_attempted',
        pathToCookieSetter: '/store/js/default/third_party_cookie_setter.html',
        returnUriKey: 'return_url',
        frameUriKey: 'frame_url',
        retainedUriParameters: ['eventid', 'descid'],
        retainedUriParameterMapping: {
            eventid: 'event',
            descid: 'desc'
        }
    };


    // http://stackoverflow.com/questions/11582512/how-to-get-url-parameters-with-javascript
    function getURLParameter(name, url) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(url) || ["", ""])[1].replace(/\+/g, '%20')) || null;
    }

    function setCookie() {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + 2);
        document.cookie = options.thirdPartyCookieName + "=1;expires=" + exdate.toUTCString() + "; path=/";
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
        var parameters = [
            options.returnUriKey + "=" + encodeURIComponent(document.referrer),
            options.frameUriKey + "=" + encodeURIComponent(window.location)
        ];
        window.top.location.href = "//" + window.location.host + options.pathToCookieSetter +  "?" + parameters.join('&');
    }

    // not in frame so third party cookie bug not an issue
    function inFrame() {
        return (window.top !== window.self);
    }

    function returnToParent() {
        var returnUrl = getURLParameter(options.returnUriKey, location.search);

        if (returnUrl != null) {
            returnUrl += (returnUrl.split('?')[1] ? '&' : '?') + options.returnUriParameter + '=1';
            if (options.retainedUriParameters.length) {
                var frameUrl = getURLParameter(options.frameUriKey, location.search);

                for (var i = 0; i < options.retainedUriParameters.length; i++) {

                    var uriParam = options.retainedUriParameters[i];
                    var paramValue = getURLParameter(uriParam, frameUrl);

                    if (paramValue != null) {
                        if (options.retainedUriParameterMapping[uriParam]) {
                            uriParam = options.retainedUriParameterMapping[uriParam];
                        }
                        returnUrl += '&' + uriParam + '=' + paramValue;
                    }
                };
            }
        }

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
