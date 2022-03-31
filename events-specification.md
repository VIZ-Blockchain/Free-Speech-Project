# Voice Events protocol on VIZ Blockchain

## Protocol specification

* Protocol type: Custom
* Protocol name: **Voice Events**
* Protocol shortname: **VE**
* Authority type: Regular
* Protocol description: Open protocol for back-linked JSON objects in VIZ blockchain, created for extend [Voice protocol](specification.md).

## URL Scheme

Using new url scheme with format:

`viz://@account/block-number/*protocol-shortname/?parameter=value`

Where the string `event` is used as a parameter, and the numbers of event blocks separated by commas are used as the value.

## Event structure

Custom protocol have been allowing to operate with any JSON data. Weakly typed structure mean version dependece for new features implementation. If new feature broke back compatibility it is needed to increase version. If attribute is default it is not needed to exist in object. Short name of attributes required for minimize operation size.

> Example: Default version is 1. It is optional if marked by `*`.

Attribute short | Attribute long | Description
------------ | ------------ | -------------
v* | version | Increase if back compatibility is broken.
p | previous | Block number for previous account event in current protocol scope.
e | event type | Contains type of event. Available types: h (hide), e (edit).
a* | account | Contains target object account for event. If is is not specified, it is equal to transaction initiator account.
b | block | Contains target object block for event.
d* | data | Contains data for event. Optional, required for some event types, for example: e (edit).

### Event type h (hide)

Event for hiding an object from the activity feed. It does not require any additional data.

### Event type e (edit)

Event to change object data. The attribute d (data) must be a Voice protocol-compatible object.

### Event type a (add)

Event to add data to the end of the specified object parameters. Example for `d` (data) attribute structure: `{t:" Extended object."}`. For the text type object it will be add string to the end of text context. For the publication type object it will be add string to the end of title context.