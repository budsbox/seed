{
  const isSniffing = options.sniff ?? false;
  const isSemantic = !isSniffing;
  const isTrim = options.trim ?? isSniffing;
  const isRestrictedNames = isSemantic && (options.restrictNames ?? false);
  const isSemanticQuoted = options.quotedSemantics ?? isSemantic;
  const multiParameter = options.multiParameter ?? 'keep-first';
  const keepCharsetCase = options.keepCharsetCase ?? isSniffing;
}

/**
 * https://datatracker.ietf.org/doc/html/rfc6838#section-4.2
 * https://mimesniff.spec.whatwg.org/#parsing-a-mime-type
 */
mimeType
  = (&{ return isTrim} OWS)?
  essence:essence
  parameters:parameters
  (&{ return isTrim } OWS)?
  {
    const result = {
      ...essence,
      parameters,
    };
    return result;
  }

/**
 * https://mimesniff.spec.whatwg.org/#mime-type-essence
 */
essence
  = type:type '/' subtype:subtype
  { return {essence: `${type}/${subtype.subtype}`, type, ...subtype} }

/**
 * https://datatracker.ietf.org/doc/html/rfc6838#section-4.2
 * https://datatracker.ietf.org/doc/html/rfc9110#media.type
 */
type
  = type:nameToken

/**
 * https://datatracker.ietf.org/doc/html/rfc9110#media.type
 * https://datatracker.ietf.org/doc/html/rfc6838#section-4.2
 * https://datatracker.ietf.org/doc/html/rfc6838#section-4.2.8
 */
subtype
  = subtype:nameToken
    {
      const parsed = {subtype};
      const pointIndex = subtype.indexOf('.');
      if (pointIndex !== -1) {
        parsed.facet = subtype.slice(0, pointIndex + 1);
      }

      const plusIndex = subtype.lastIndexOf('+');
      if (plusIndex !== -1) {
        parsed.suffix = subtype.slice(plusIndex);
      }

      return parsed;
    }

/**
 * https://datatracker.ietf.org/doc/html/rfc9110#name-parameters
 */
parameters
  = list:parameterNext* {
    return list
      .filter(Boolean)
      .reduce((map, [key, value]) => {
        if (!map.has(key) || multiParameter !== 'keep-first') {
          map.set(key, multiParameter === 'list' ? [...(map.get(key) ?? []), value] : value);
        }

        return map;
      }, new Map())
  }

parameterNext
  = OWS ';' OWS @parameter?

/**
 * https://datatracker.ietf.org/doc/html/rfc9110#name-parameters
 * https://datatracker.ietf.org/doc/html/rfc9110#quoted.strings
 * https://datatracker.ietf.org/doc/html/rfc9110#name-tokens
 */
parameter
  = name:parameterName
    value:('=' @parameterValue / &{ return isSniffing } [^;]* { return null })
    {
      return (name == null) || (value == null) ? null
        : [name, !keepCharsetCase && name === 'charset' ? value.toLowerCase() : value];
    }

/**
 * https://datatracker.ietf.org/doc/html/rfc9110#name-tokens
 * https://datatracker.ietf.org/doc/html/rfc6838#section-4.3
 */
parameterName
  = @nameToken &([;=] / !.) / &{ return isSniffing } [^=;]* { return null }

/**
 * https://datatracker.ietf.org/doc/html/rfc9110#name-parameters
 * https://mimesniff.spec.whatwg.org/#parsing-a-mime-type
 */
parameterValue
  = &{ return isSniffing } @(sniffQuotedValue / sniffUnquotedValue) /
    &{ return isSemantic } @(httpQuotedString / httpToken)

sniffQuotedValue
  = @(httpQuotedString / skipQuotedString) [^;]*

skipQuotedString
  = '"' (httpQuotedPair / [^"])* ('"' / !.) { return null }

sniffUnquotedValue
  = !'"' @(@$(OWS sniffUnquotedValuePart)+ OWS) &(';' / !.)

sniffUnquotedValuePart
  = (!(whatwgHttpWhitespace / ';') httpQuotedTokenChar)+

/**
 * https://datatracker.ietf.org/doc/html/rfc9110#quoted.strings
 * https://fetch.spec.whatwg.org/#collect-an-http-quoted-string
 */
httpQuotedString 'semantic quoted string'
  = '"' content:(httpQuotedPair / httpQuotedStringChar)* ('"' / (&{ return isSniffing } !.))
    { return content.join('') }

/**
 * https://datatracker.ietf.org/doc/html/rfc9110#quoted.strings
 */
httpQuotedPair
  = '\\' @([ \t\u0020-\u007e\u0080-\u00FF])

/**
 * https://mimesniff.spec.whatwg.org/#http-quoted-string-token-code-point
 * https://datatracker.ietf.org/doc/html/rfc9110#name-quoted-strings
 */
httpQuotedStringChar 'HTTP quoted string char'
  = !'"' @httpQuotedTokenChar

/**
 * https://mimesniff.spec.whatwg.org/#http-quoted-string-token-code-point
 */
httpQuotedTokenChar 'HTTP quoted string token char'
  = [\t\u0020-\u007e\u0080-\u00FF]

nameToken
  = (!{ return isRestrictedNames } httpToken / &{ return isRestrictedNames } restrictedName)
  { return text().toLowerCase() }

/**
 * https://datatracker.ietf.org/doc/html/rfc9110#name-tokens
 * https://mimesniff.spec.whatwg.org/#http-token-code-point
 */
httpToken 'HTTP token'
  = $[a-z0-9!#$%&'*+\-.^_`|~]i+

/**
 * https://datatracker.ietf.org/doc/html/rfc6838#section-4.2
 */
restrictedName 'restricted-name'
  = $([a-z0-9]i [a-z0-9!#$&+\-.^_]i*)

/**
 * https://datatracker.ietf.org/doc/html/rfc9110#name-whitespace
 */
OWS 'whitespace'
  = $(&{ return isSemantic} [ \t]*) /
    $(&{ return isSniffing } whatwgHttpWhitespace*)

/**
 * https://fetch.spec.whatwg.org/#http-whitespace
 */
whatwgHttpWhitespace 'Fetch HTTP whitespace ([ \\t\\r\\n])'
  = [ \t\r\n]
