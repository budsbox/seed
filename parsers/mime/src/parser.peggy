{
  const isSniffing = options.sniff ?? false;
  const isTrim = options.trim ?? isSniffing;
  const isRestricted = options.restrictNames ?? !isSniffing;
}

// todo: доопределить на этом объекте метод toString
mimeType
  = (&{ return isTrim} httpWhitespace*)?
  essence:essence httpWhitespace*
  parameters:parameters
  (&{ return isSniffing } httpWhitespace* ';')?
  (&{ return isTrim } httpWhitespace*)?
  {return {...essence, parameters}}

essence
  = type:type '/' subtype:subtype { return {essence: text().toLowerCase(), type, ...subtype} }

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

subtypeTrail
  = first:subtypeTrailPart rest:(part:('+' subtypeTrailPart) { return part.join('') })* { return [first, ...rest]}

subtypeTrailPart
  = (
      (&{ return isRestricted } restrictedNameFirstChar (restrictedNameChar / '.')*) /
        (!{ return isRestricted } (!'+' httpTokenChar)+)
    )
    { return text().toLowerCase() }

tree
  = (
    (&{ return isRestricted } restrictedNameFirstChar restrictedNameChar*) /
      (!{ return isRestricted } (![.+] httpTokenChar)+)
  )
  '.'
  { return text().toLowerCase() }

parameters
  = first:parameterFirst? list:parameterNext* {
    return [...(Boolean(first) ? [first] : []), ...list].filter(([name, value]) => value !== '').reduce((map, [key, value]) => {
      if (!map.has(key)) {
        map.set(key, value);
      }
      return map;
    }, new Map())
  }

parameterFirst
  = @parameter

parameterNext
  = parameterPrefix @parameter

parameter
  = name:parameterName
    value:(('=' strippedValue:parameterValue {return strippedValue}) / $[^;]* { return '' })
    {return [name, name === 'charset' ? value.toLowerCase() : value]}

parameterPrefix
  = ';' httpWhitespace*

parameterName
  = name:$(
      (&{ return isRestricted } restrictedNameFirstChar restrictedNameChar*) /
        (!{return isRestricted} [^=;]+)
    )
    { return name.toLowerCase() }

parameterValue
  = (@httpQuotedString [^;]*) / (@$parameterUnquotedValue+ $httpWhitespace*)

parameterUnquotedValue
  = (!httpWhitespace [^;])+ (httpWhitespace+ parameterUnquotedValue)?

httpQuotedString
  = '"' content:(httpQuotedStringChar*) '"' {return content.join('')}

httpQuotedStringChar
  = ('\\' @'"') / (!'"' @.)

httpTokenChar
  = [a-z0-9!#$%&'*+\-.^_`|~]i

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

httpWhitespace
  = [ \t\r\n]
