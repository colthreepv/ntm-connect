# ntm-deviceportal

## Design

Website is on `portal.ntm-connect.online`, project running this is serverful.
When user clicks a salePoint, makes an ajax request to create-session for the specific subdomain, ex: `esi-maiorana-843d.ntm-connect.online/api/session`
This will create 2 sessions:

- JSESSIONID from device
- session from firebase

So serverful should have only:
/api/sale-points
/\* - website

proxy should have all the other endpoints

### Regarding development

Website is on `http://ntm-connect.local:3000`, project running this is web, it will proxy requests to serverful.
Also `proxy` project should be running.

When a user clicks a salePoint, shows a progress on the table, until it's green or red.
If green-light, the user can click again to open the portal in a new tab, redirecting to `http://esi-maiorana-843d.ntm-connect.local:3004/boss`

This requires the developer to have an etc/hosts file similar to this:

```text
127.0.0.1 ntm-connect.local
127.0.0.1 *.ntm-connect.local
```
