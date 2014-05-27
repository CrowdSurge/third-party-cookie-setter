# Third Party Cookie Setter

It is sometimes not possible to set a cookie from a third party
framed site the first time a user visits the page.

This is often necessary for a legitimate site to function.

This solution fixes this issue by attempting to set a cookie, or
redirecting the user out of the frame to to parent window,
setting a cookie, and returning the user back to the parent page
and framed page.

### Languages

JavaScript

### Example

The framed site includes the check if the cookie can be set and whether an attempt has been
  made

```javascript
<script src="/path/to/csThirdPartyCookie.js"></script>
<script>
window.onload= function(){
    var thirdPartyCookie = new csThirdPartyCookie();
    if (!thirdPartyCookie.check()) {
        // cookies cannot be set so user should be informed
    }
};
</script>
```

The cookie setter sets a cookie and returns to the parent and framed page
made

```javascript
<script src="/path/to/csThirdPartyCookie.js"></script>
<script>
window.onload= function(){
    var thirdPartyCookie = new csThirdPartyCookie();
    thirdPartyCookie.setAndReturn();
};
</script>
````

### Demo

Open the below URL in a reset (Safari > Reset Safari..) instance of Safari (or another browser that doesn't support third party cookies) and you should see the page on crowdsurge.com, holding an iframe from amazonaws.com perform a redirect on the top window to amazonaws.com where a cookie is then set and automatically redirected to the original URL. Inspect cookies to see 'cs_thid_party_accept' has now been set on amazonaws.com.

http://www.crowdsurge.com/public-repos/third-party-cookie-setter/example/