# Voice protocol on VIZ Blockchain

## Protocol specification

* Protocol type: Custom
* Protocol name: **Voice**
* Protocol shortname: **V**
* Authority type: Regular
* Protocol description: Open protocol for back-linked JSON objects in VIZ blockchain, created for account activity with customazable types.

Account create custom protocol operation and wrote JSON object with back-link to previous object in history. If blockchain is going forward, Voice protocol can be readed backward. It can be done if blockchain node store block number of contains last custom protocol operation (available by `custom_protocol_api` plugin).

> Example: Account A wrote custom operations in blocks: 100, 150, 200. Blockchain store that account A last custom operation in block 200. We can extract operations from block number 200 and search for activity from account A. Operation contain JSON object with attribute, that contain previous block number with same protocol activity: 150. We can step down every time going to parse back-linked JSON objects for achive all account A activity. That's it! Backward activity feed in move forward blockchain architecture.

## URL Scheme

Using new url scheme with format:

`viz://@account/block-number/*protocol-shortname/`

Provide simple access to specific data from account in block number. Protocol shortname is optional.

## Object structure

Custom protocol have been allowing to operate with any JSON data. Weakly typed structure mean version dependece for new features implementation. If new feature broke back compatibility it is needed to increase version. If attribute is default it is not needed to exist in object. Short name of attributes required for minimize operation size.

> Example: Default version is 1. It is optional if marked by `*`.

Attribute short | Attribute long | Description
------------ | ------------ | -------------
v* | version | Increase if back compatibility is broken.
p | previous | Block number for previous account activity in current protocol scope.
t | type | Contains type of object. Default value: t (text).
d | data | Contains data of object.

### Data structure for text type

Type description: Simple short text note without markup.

Attribute short | Attribute long | Description
------------ | ------------ | -------------
t | text | Simple text note.
r* | reply | Link to replied context in `viz://` url scheme.
s* | share | Link to shared context in any url scheme.
b* | beneficiaries | Array of objects contains `{account,weight}` for awarding beneficiaries details.

### Data structure for publication type

Type description: Extended text with voice markdown markup.

Attribute short | Attribute long | Description
------------ | ------------ | -------------
t | title | Publication title.
m | markdown | Publication text with voice markdown.
d* | description | Publication short description for preview.
i* | image | Link to publication image for preview thumbnail.
r* | reply | Link to replied context in `viz://` url scheme.
s* | share | Link to shared context in any url scheme.
b* | beneficiaries | Array of objects contains `{account,weight}` for awarding beneficiaries details.