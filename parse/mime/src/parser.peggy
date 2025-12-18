{
  const isSniffing = options.sniff ?? false;
  const isSemantic = !isSniffing;
  const isTrim = options.trim ?? isSniffing;
  const isRestricted = options.restrictNames ?? isSemantic;
  const isSemanticQuoted = options.quotedSemantics ?? isSemantic;
  const multiParameter = options.multiParameter ?? 'keep-first';
  const keepCharsetCase = options.keepCharsetCase ?? isSniffing;
}

/**
 * @see https://datatracker.ietf.org/doc/html/rfc6838#section-4.2
 * @see https://mimesniff.spec.whatwg.org/#parsing-a-mime-type
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

essence
  = type:type '/' subtype:subtype
  { return {essence: text().toLowerCase(), type, ...subtype} }

/**
 * @see https://datatracker.ietf.org/doc/html/rfc6838#section-4.2
 */
type
  = (isRestrictedName / (!{ return isRestricted } httpToken))
  { return text().toLowerCase() }

/**
 * @see https://datatracker.ietf.org/doc/html/rfc6838#section-4.2
 * @see https://datatracker.ietf.org/doc/html/rfc6838#section-4.2.8
 */
subtype
  = subtype:(isRestrictedName / !{ return isRestricted } @httpToken)
    {
      subtype = subtype.toLowerCase();
      const parsed = {subtype};
      if (subtype.includes('.')) {
        parsed.facet = subtype.slice(0, subtype.indexOf('.') + 1);
      }

      if (subtype.includes('+')) {
        parsed.suffix = subtype.slice(subtype.indexOf('+'));
      }

      return parsed;
    }

/**
 * @see https://datatracker.ietf.org/doc/html/rfc9110#name-parameters
 * @see https://datatracker.ietf.org/doc/html/rfc9110#name-parameters
 * @see https://datatracker.ietf.org/doc/html/rfc9110#name-collected-abnf
 * @see https://mimesniff.spec.whatwg.org/#parsing-a-mime-type
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
  = parameterPrefix @parameter?

/**
 * @see https://datatracker.ietf.org/doc/html/rfc9110#name-parameters
 * @see https://datatracker.ietf.org/doc/html/rfc9110#quoted.strings
 * @see https://datatracker.ietf.org/doc/html/rfc9110#name-parameters
 * @see https://datatracker.ietf.org/doc/html/rfc9110#name-tokens
 * @see https://datatracker.ietf.org/doc/html/rfc9110#name-collected-abnf
 * @see https://mimesniff.spec.whatwg.org/#parsing-a-mime-type
 */
parameter
  = name:parameterName
    value:(('=' strippedValue:parameterValue {return strippedValue}) / (&{ return isSniffing } $[^;]* { return null }))
    {
      return (name == null) || (value == null) ? null : [name, (!keepCharsetCase && (name === 'charset')) ? value.toLowerCase() : value];
    }

parameterPrefix
  = OWS ';' OWS

/**
 * @see https://datatracker.ietf.org/doc/html/rfc6838#section-4.3
 * @see https://mimesniff.spec.whatwg.org/#parsing-a-mime-type
 */
parameterName
  = name:(
      isRestrictedName /
        (!{return isRestricted} sName:sniffParameterName { return sName })
    )
    { return name == null ? null : name.toLowerCase() }

sniffParameterName
  = (token:httpToken &[;=] { return token; }) / ([^=;]* { return null })

/**
 * @see https://datatracker.ietf.org/doc/html/rfc9110#name-parameters
 * @see https://mimesniff.spec.whatwg.org/#parsing-a-mime-type
 */
parameterValue
  = parameterSemanticValue / sniffParameterValue

parameterSemanticValue
  = &{ return isSemantic } @(semanticQuotedString / httpToken)

sniffParameterValue
  = &{ return isSniffing } @(sniffQuotedValue / sniffUnquotedValue / skipParameterValue)

sniffQuotedValue
  = @(semanticQuotedString / skipQuotedString) [^;]*

skipQuotedString
  = '"' (httpQuotedPair / [^"])* ('"' / !.) { return null }

/**
 * @see https://mimesniff.spec.whatwg.org/#parsing-a-mime-type
 */
sniffUnquotedValue
  = !'"' @(@$((OWS sniffUnquotedValuePart)+) OWS) &(';' / !.) / @skipParameterValue

sniffUnquotedValuePart
  = $(!(fetchHttpWhitespace / ';') httpQuotedTokenChar)+

skipParameterValue
  = &{ return isSniffing } [^;]+ { return null }

/**
 * @see https://datatracker.ietf.org/doc/html/rfc9110#quoted.strings
 * @see https://fetch.spec.whatwg.org/#collect-an-http-quoted-string
 */
semanticQuotedString 'semantic quoted string'
  = '"' content:(httpQuotedPair / httpQuotedStringChar)* ('"' / (&{ return isSniffing } !.))
    { return content.join('') }

/**
 * @see https://datatracker.ietf.org/doc/html/rfc9110#quoted.strings
 */
httpQuotedPair
  = '\\' @([ \t\u0020-\u007e\u0080-\u00FF])

/**
 * @see https://mimesniff.spec.whatwg.org/#http-quoted-string-token-code-point
 * @see https://datatracker.ietf.org/doc/html/rfc9110#name-quoted-strings
 */
httpQuotedStringChar 'HTTP quoted string char'
  = !'"' @httpQuotedTokenChar

/**
 * @see https://mimesniff.spec.whatwg.org/#http-quoted-string-token-code-point
 */
httpQuotedTokenChar 'HTTP quoted string token char'
  = [\t\u0020-\u007e\u0080-\u00FF]

isRestrictedName
  = &{ return isRestricted } @restrictedName

/**
 * @see https://datatracker.ietf.org/doc/html/rfc9110#name-tokens
 */
httpToken 'HTTP token'
  = token:httpTokenChar+ { return token.join('')}

/**
 * @see https://mimesniff.spec.whatwg.org/#http-token-code-point
 * @see https://datatracker.ietf.org/doc/html/rfc9110#section-5.6.2
 */
httpTokenChar 'HTTP Token char'
  = [a-z0-9!#$%&'*+\-.^_`|~]i

/**
 * @see https://datatracker.ietf.org/doc/html/rfc6838#section-4.2
 */
restrictedName 'restricted-name'
  = $(restrictedNameFirstChar restrictedNameChar*)

restrictedNameFirstChar 'restricted-name first char ([a-z0-9]i)'
  = [a-z0-9]i

restrictedNameChar 'restricted-name char ([a-z0-9"!#$&\-^_"]i)'
  = [a-z0-9"!#$&+\-.^_"]i

/**
 * @see https://datatracker.ietf.org/doc/html/rfc9110#name-whitespace
 */
OWS 'whitespace'
  = $(&{ return isSemantic} [ \t]*) /
    $(&{ return isSniffing } fetchHttpWhitespace*)

/**
 * @see https://fetch.spec.whatwg.org/#http-whitespace
 */
fetchHttpWhitespace 'Fetch HTTP whitespace ([ \\t\\r\\n])'
  = [ \t\r\n]
