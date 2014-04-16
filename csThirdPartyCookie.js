/**
 * Copyright (C) 2014 CrowdSurge
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
 * and associated documentation files (the "Software"), to deal in the Software without restriction, 
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, 
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software 
 * is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies 
 * or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING 
 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 *
 * csThirdPartyCookie
 * 
 * Fix to set cookies for a third party framed site. If the frame is unable to set a cookie,
 * the fix is to redirect the user to the third party site in the parent current window, set
 * a cookie and return to the parent and framed page the user was on.
 * 
 * Example:
 * 
 * The framed site includes the check if the cookie can be set and whether an attempt has been 
 * made
 * 
 * <script src="/path/to/csThirdPartyCookie.js"></script>
 * <script>
 * window.onload= function(){               
 *     var thirdPartyCookie = new csThirdPartyCookie();
 *     if (!thirdPartyCookie.check()) {
 *         // cookies cannot be set so user should be informed
 *     }
 * };
 * </script>
 *
 * The cookie setter sets a cookie and returns to the parent and framed page 
 * made
 * 
 * <script src="/path/to/csThirdPartyCookie.js"></script>
 * <script>
 * window.onload= function(){               
 *     var thirdPartyCookie = new csThirdPartyCookie();
 *     thirdPartyCookie.setAndReturn();
 * };
 * </script>
 * 
 */
var csThirdPartyCookie = function () {
    'use strict';

    /**
     * config options
     */
    var options = {
        // the cookie to set
        thirdPartyCookieName: 'cs_third_party_accept',
        // uri parameter appended to parent to check if the fix has already been attempted
        returnUriParameter: 'cookie_attempted',
        // file that sets a cookie in the parent and returns to the original page
        pathToCookieSetter: '/store/js/default/third_party_cookie_setter.html',
        // url to return to after cookie set
        returnUriKey: 'return_url',
        // frame url
        frameUriKey: 'frame_url',
        // whitelist array of frame uri parts to map to the parent uri
        retainedUriParameters: ['eventid', 'descid'],
        // the mapping to perform
        retainedUriParameterMapping: {
            eventid: 'event',
            descid: 'desc'
        }
    };


    /**
     * Returns the matched uri parameter
     * 
     * Source: http://stackoverflow.com/questions/11582512/how-to-get-url-parameters-with-javascript
     * 
     * @param {string} name
     * @param {string} url
     * @returns {string}
     */
    function getURLParameter(name, url) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(url) || ["", ""])[1].replace(/\+/g, '%20')) || null;
    }

    /**
     * Sets a cookie for the domain
     */
    function setCookie() {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + 2);
        document.cookie = options.thirdPartyCookieName + "=1;expires=" + exdate.toUTCString() + "; path=/";
    }

    /**
     * Check whether the cookie is set
     * 
     * @returns {Boolean}
     */
    function isCookieSet() {
        return (document.cookie.indexOf(options.thirdPartyCookieName) > -1);
    }

    /**
     * Check if an attempt to set a cookei form the parent window has been attempted
     * 
     * @returns {Boolean}
     */
    function isReturnedFromRedirect() {
        var re = new RegExp("[?|&]" + options.returnUriParameter + "=1", "i");
        return (document.referrer.search(re) > 0);
    }

    /**
     * Handles cookies cannot be set from frame
     * 
     * @returns {Boolean}
     */
    function unableToSetCookie() {
        console.log('Cookies must be enabled');
        return false;
    }

    /**
     * Redirect to cookie setter in parent
     * passes the top url as a uri parameter
     *
     * document referrer as the returnUriKey works if the check is made on the first framed page loaded from the 
     * parent. To use from within the framed site you will need to track the parent url through an integration 
     * script or other means. 
     * 
     */
    function redirectToSetCookie() {
        var parameters = [
            options.returnUriKey + "=" + encodeURIComponent(document.referrer), 
            options.frameUriKey + "=" + encodeURIComponent(window.location)
        ];
        window.top.location.href = "//" + window.location.host + options.pathToCookieSetter +  "?" + parameters.join('&');
    }

    /**
     * Guard to check site is not loaded in a frame so cookei setting check not required
     * 
     * @returns {Boolean}
     */
    function inFrame() {
        return (window.top !== window.self);
    }

    /**
     * Redirects the user back to the parent page and the framed page
     */
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

    /**
     * Checks the framed page can set cookies and redirects to the cookie setter if required
     * 
     * @returns {Boolean}
     */
    function check() {
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

    /**
     * Sets a cookie and returns to parent and framed page
     */
    function setAndReturn() {
        setCookie();
        returnToParent();
    }

    return {
        check: check,
        setAndReturn: setAndReturn
    };

};