main
  = $httpWhitespace* str:mimeTypeString $httpWhitespace* {return str}

mimeTypeString
  = essence:essence httpWhitespace* parameters:parameters {return {...essence, parameters}}

essence
  = type:type '/' subtype:subtype { return {essence: text().toLowerCase(), type, ...subtype} }

type
  = $httpTokenChar+ { return text().toLowerCase() }

subtype
  = tree:(token:tree '.' {return token.toLowerCase()})?
  name:(token:subtypeName { return token.toLowerCase() })
  suffix:('+' token:subtypeSuffix {return token})?
  {return {subtype: text().toLowerCase(), subtypeTokens: {tree, name, suffix}}}

tree
  = (![.+] httpTokenChar)+ {return text().toLowerCase()}

subtypeName
  = (!'+' httpTokenChar)+ {return text().toLowerCase()}

subtypeSuffix
  = (!'+' httpTokenChar)+ {return text().toLowerCase()}

parameters
  = list:parameter* {
    return list.filter(([name, value]) => value !== '').reduce((map, [key, value]) => {
      if (!map.has(key)) {
        map.set(key, value);
      }
      return map;
    }, new Map())
  }

parameter
  = parameterPrefix
    name:parameterName
    value:(('=' strippedValue:parameterValue {return strippedValue}) / $[^;]* { return '' })
    {return [name, value]}

parameterPrefix
  = ';' httpWhitespace*

parameterName
  = name:$[^=;]+ { return name.toLowerCase() }

parameterValue
  = (@httpQuotedString [^;]*) / (@$parameterUnquotedValue+ $httpWhitespace*)

parameterUnquotedValue
  = (!httpWhitespace [^;])+ (httpWhitespace+ parameterUnquotedValue)?

httpQuotedString
  = '"' @($httpQuotedStringChar*) '"'

httpQuotedStringChar
  = ('\\' @'"') / (!'"' @.)

httpTokenChar
  = [a-z0-9!#$%&'*+\-.^_`|~]i

httpWhitespace
  = [ \t\r\n]
