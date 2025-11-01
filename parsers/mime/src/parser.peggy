{
  const isSniffing = options.sniff ?? true;
  const isSemantic = !isSniffing
  const isTrim = options.trim ?? isSniffing;
  const isRestricted = options.restrictNames ?? isSemantic;
  const isSemanticQuoted = options.quotedSemantics ?? isSemantic;

  const isHttpQuotedStringCompatible = (str) => /^[\t\u0020-\u007e\u0080-\u00FF]+$/i.test(str);
}

// mediaRange

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
  = type:type '/' subtype:subtype { return {essence: text().toLowerCase(), type, ...subtype} }

/**
 * @see https://datatracker.ietf.org/doc/html/rfc6838#section-4.2
 */
type
  = httpTokenChar+ { return text().toLowerCase() }

/**
 * @see https://datatracker.ietf.org/doc/html/rfc6838#section-4.2
 */
subtype
  = tree:tree ?
  trail:subtypeTrail
  {
    let name, suffix = null;
    if (trail.length > 1) {
      suffix = trail.pop();
      name = trail.join('');
    } else {
      [name] = trail;
    }

    return {subtype: text().toLowerCase(), subtypeTokens: {tree, name, suffix}}
  }

/**
 * @see https://datatracker.ietf.org/doc/html/rfc6838#section-4.2
 */
tree
  = (
    (&{ return isRestricted } restrictedNameFirstChar restrictedNameChar*) /
      (!{ return isRestricted } (![.+] httpTokenChar)+)
  )
  '.'
  { return text().toLowerCase() }

/**
 * @see https://datatracker.ietf.org/doc/html/rfc6838#section-4.2.8
 */
subtypeTrail
  = first:subtypeTrailPart rest:(part:('+' subtypeTrailPart) { return part.join('') })* { return [first, ...rest]}

subtypeTrailPart
  = (
      (&{ return isRestricted } restrictedNameFirstChar (restrictedNameChar / '.')*) /
        (!{ return isRestricted } (!'+' httpTokenChar)+)
    )
    { return text().toLowerCase() }


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
        if (!map.has(key)) {
          map.set(key, value);
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
    value:(('=' strippedValue:parameterValue {return strippedValue}) / $[^;]* { return null })
    {
      return (name == null) || (value == null) ? null : [name, name === 'charset' ? value.toLowerCase() : value]
    }

parameterPrefix
  = OWS ';' OWS

/**
 * @see https://datatracker.ietf.org/doc/html/rfc6838#section-4.3
 * @see https://mimesniff.spec.whatwg.org/#parsing-a-mime-type
 */
parameterName
  = name:(
      (&{ return isRestricted } rName:restrictedName { return rName }) /
        (!{return isRestricted} wName:whatwgParameterName { return wName })
    )
    { return name == null ? null : name.toLowerCase() }

whatwgParameterName
  = (token:httpToken &[;=] { return token; }) / ([^=;]* { return null })

/**
 * @see https://datatracker.ietf.org/doc/html/rfc9110#name-parameters
 * @see https://mimesniff.spec.whatwg.org/#parsing-a-mime-type
 */
parameterValue
  = semanticQuotedString / parameterUnquotedValue / @skipParameterValue

/**
 * @see https://fetch.spec.whatwg.org/#collect-an-http-quoted-string
 * @see https://datatracker.ietf.org/doc/html/rfc9110#name-parameters
 * @see https://datatracker.ietf.org/doc/html/rfc9110#name-tokens
 */
parameterUnquotedValue
  = (&{ return isSemantic } @httpToken) / (&{ return isSniffing } @whatwgUnquotedValue)

/**
 * @see https://mimesniff.spec.whatwg.org/#parsing-a-mime-type
 */
whatwgUnquotedValue
  = !DQUOTE @(@$(whatwgUnquotedValuePart (RWS whatwgUnquotedValuePart)*) OWS) / @skipParameterValue

whatwgUnquotedValuePart
  = $(!(fetchHttpWhitespace / ';') httpQuotedTokenChar)+

/**
 * @see https://datatracker.ietf.org/doc/html/rfc9110#quoted.strings
 * @see https://fetch.spec.whatwg.org/#collect-an-http-quoted-string
 */
semanticQuotedString 'semantic quoted-string'
  = DQUOTE content:(httpQuotedPair / httpQuotedStringChar)* DQUOTE { return content.length === 0 ? null : content.join('') }

skipParameterValue
  = [^;]+ { return null }

/**
 * @see https://datatracker.ietf.org/doc/html/rfc9110#quoted.strings
 */
httpQuotedPair
  = '\\' @(HTAB / SP / VCHAR / obsText)

/**
 * @see https://mimesniff.spec.whatwg.org/#http-quoted-string-token-code-point
 * @see https://datatracker.ietf.org/doc/html/rfc9110#name-quoted-strings
 */
httpQuotedStringChar
  = !'"' @httpQuotedTokenChar

/**
 * @see https://mimesniff.spec.whatwg.org/#http-quoted-string-token-code-point
 */
httpQuotedTokenChar
  = [\t\u0020-\u007e\u0080-\u00FF]

/**
 * @see https://datatracker.ietf.org/doc/html/rfc9110#name-tokens
 */
httpToken
  = token:httpTokenChar+ { return token.join('')}

/**
 * @see https://mimesniff.spec.whatwg.org/#http-token-code-point
 * @see https://datatracker.ietf.org/doc/html/rfc9110#section-5.6.2
 */
httpTokenChar
  = [a-z0-9!#$%&'*+\-.^_`|~]i

restrictedName 'restricted-name'
  = $(restrictedNameFirstChar restrictedNameChar*)

/**
 * @see https://datatracker.ietf.org/doc/html/rfc6838#section-4.2
 */
restrictedNameFirstChar
  = [a-z0-9]i

/**
 * @see https://datatracker.ietf.org/doc/html/rfc6838#section-4.2
 */
restrictedNameChar
  = [a-z0-9"!#$&\-^_"]i
/**
 * @see https://datatracker.ietf.org/doc/html/rfc9110#name-field-values
 */
obsText
  = [\u0080-\u00FF]

/**
 * @see https://datatracker.ietf.org/doc/html/rfc9110#name-syntax-notation
 */
VCHAR 'any visible ASCII char'
  = [\u0020-\u007e]

RWS 'required whitespaces'
  = $(&{ return isSemantic} semanticWhitespace+) /
    $(&{ return isSniffing } fetchHttpWhitespace+)

OWS 'optional whitespaces'
  = $(&{ return isSemantic} semanticWhitespace*) /
    $(&{ return isSniffing } fetchHttpWhitespace*)

/**
 * @see https://fetch.spec.whatwg.org/#http-whitespace
 */
fetchHttpWhitespace 'whitespaces of Fetch spec'
  = CR / LF / HTAB / SP

/**
 * @see https://datatracker.ietf.org/doc/html/rfc9110#name-whitespace
 */
semanticWhitespace 'HTTP Semantic whitespace'
  = HTAB / SP

CR 'caret return'
  ='\r'

LF 'line feeding'
  ='\n'

HTAB 'horizontal tab'
  = '\t'

SP 'space'
  = ' '

DQUOTE 'double quote'
  = '"'
