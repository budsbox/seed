{
  const isSniffing = options.sniff ?? true;
  const isSemantic = !isSniffing
  const isTrim = options.trim ?? isSniffing;
  const isRestricted = options.restrictNames ?? isSemantic;
  const isSemanticQuoted = options.quotedSemantics ?? isSemantic;

  const isHttpToken = (str) => /^[a-z0-9!#$%&'*+\-.^_`|~]+$/i.test(str);
  const isHttpQuotedStringCompatible = (str) => /^[\t\u0020-\u007e\u0080-\u00FF]+$/i.test(str);

  const mimeTypeToString = ({essence, parameters}) =>
    `${essence}${
      [...parameters]
        .map(([name, value]) => [
          name,
          isHttpToken(value) ? value : `"${value.replace(/"/g, '\\"')}"`,
        ])
        .map(([name, value]) => `;${name}=${value}`)
        .join('')
    }`;
}

// mediaRange

/**
 * @see https://datatracker.ietf.org/doc/html/rfc6838#section-4.2
 * @see https://mimesniff.spec.whatwg.org/#parsing-a-mime-type
 */
mimeType
  = (&{ return isTrim} httpWhitespace*)?
  essence:essence
  parameters:parameters
  (&{ return isTrim } httpWhitespace*)?
  {
    const result = {
      ...essence,
      parameters,
    };

    const toString = () => mimeTypeToString(result);
    Object.defineProperty(toString, 'name', { value: 'toString' });
    Object.defineProperty(result, 'toString', {
      value: toString
    })
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
      .filter(([name, value]) => isHttpQuotedStringCompatible(value) && value !== '')
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
    value:(('=' strippedValue:parameterValue {return strippedValue}) / $[^;]* { return '' })
    {
      return (name == null) || (value == null) ? null : [name, name === 'charset' ? value.toLowerCase() : value]
    }

parameterPrefix
  = skipWhitespaces ';' skipWhitespaces

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
  = parameterQuotedValue / parameterUnquotedValue

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
  = value:[^;]+ { return value.join('').replace(/[ \t\r\n]+$/, '') }

/**
 * @see https://datatracker.ietf.org/doc/html/rfc9110#quoted.strings
 */
parameterQuotedValue
  = (&{ return isSemantic } @semanticQuotedString) / (&{ return isSniffing } @whatwgQuotedString [^;]*)

/**
 * @see https://datatracker.ietf.org/doc/html/rfc9110#quoted.strings
 * @see https://fetch.spec.whatwg.org/#collect-an-http-quoted-string
 */
semanticQuotedString
  = DQUOTE content:(semanticQuotedChar / semanticQuotedPair)* DQUOTE { return content.join('') }

/**
 * @see https://datatracker.ietf.org/doc/html/rfc9110#quoted.strings
 */
semanticQuotedChar
  = HTAB / SP / [!#-[\]-~] / obsText

/**
 * @see https://datatracker.ietf.org/doc/html/rfc9110#quoted.strings
 */
semanticQuotedPair
  = '\\' @(HTAB / SP / VCHAR / obsText)

/**
 * @see https://fetch.spec.whatwg.org/#collect-an-http-quoted-string
 */
whatwgQuotedString
  = DQUOTE content:(whatwgQuotedPair / whatwgQuotedChar)* DQUOTE { return content.join('') }

/**
 * @see https://fetch.spec.whatwg.org/#collect-an-http-quoted-string
 */
whatwgQuotedPair
  = (@'\\' &(!.)) / ('\\' @.)

/**
 * @see https://fetch.spec.whatwg.org/#collect-an-http-quoted-string
 */
whatwgQuotedChar
  = [^"\\]

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

restrictedName
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
 * Any visible ASCII char
 * @see https://datatracker.ietf.org/doc/html/rfc9110#name-syntax-notation
 */
VCHAR
  = [\u0020-\u007e]

skipWhitespaces
  = (!{ return isSniffing} OWS) / (&{ return isSniffing } httpWhitespace*)

/**
 * @see https://datatracker.ietf.org/doc/html/rfc9110#name-whitespace
 */
OWS
  = (HTAB / SP)*

/**
 * @see https://fetch.spec.whatwg.org/#http-whitespace
 */
httpWhitespace
  = CR / LF / HTAB / SP

CR
  ='\r'

LF
  ='\n'

HTAB
  = '\t'

SP
  = ' '

DQUOTE
  = '"'
