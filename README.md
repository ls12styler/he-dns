# HE.net DynDNS Updater

A Docker image that contains a JavaScript/NodeJS application that acts as dynamic DNS update client for https://dyn.dns.he.net and uses https://ipify.org for fetching the external IP address.

## Options

### DOMAIN

**REQUIRED**

The hostname that you want to update the record for.

### KEY

**REQUIRED**

The key you've created for modification of the DNS record.

### POLL_MS

**OPTIONAL**

How frequently to check for updates, in MS.
Default: 300000 (5 minutes)

### TIMEOUT_MS

**OPTIONAL**

How long until the HTTP requests wait until they error, in MS.
Default: 1000 (1 second)

## Running

```
docker run -d -t --rm \
  -e DOMAIN=my.example.com \
  -e KEY=MyKeyForHEDomain \
  -e POLL_MS=5000 \
  -e TIMEOUT_MS=500 \
  $IMG
```
(Where $IMG is the ID of the built container from `docker build .`).
