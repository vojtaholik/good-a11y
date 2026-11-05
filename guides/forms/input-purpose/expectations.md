# Expectations: input-purpose

1. Name fields carry the token for their label: a full name field `name`, a first name field `given-name`, a last name field `family-name`.
2. The email field carries `email` and the phone field carries `tel`.
3. Address fields carry their tokens, alone or after a `shipping` or `billing` prefix: street `street-address` or `address-line1`, city `address-level2`, postal code `postal-code`, country `country-name` or `country`.
4. Pasting into any of these fields, a confirm field included, is not blocked.
