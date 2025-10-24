looseMimeType
  = $httpWhitespace* str:validMimeType $httpWhitespace* ';'? {return str}
// todo: доопределить на этом объекте метод toString
validMimeType
  = essence:essence httpWhitespace* parameters:parameters {return {...essence, parameters}}

essence
  = type:type '/' subtype:subtype { return {essence: text().toLowerCase(), type, ...subtype} }

type
  = httpTokenChar+ { return text().toLowerCase() }

subtype
  = tree:treeWithDelimiter ?
  name:subtypeName
  suffix:subtypeSuffixWithDelimiter?
  {return {subtype: text().toLowerCase(), subtypeTokens: {tree, name, suffix}}}

treeWithDelimiter
  = @tree '.'

tree
  = (![.+] httpTokenChar)+ {return text().toLowerCase()}

subtypeName
  = (!'+' httpTokenChar)+ {return text().toLowerCase()}

subtypeSuffixWithDelimiter
  = '+' @subtypeSuffix

subtypeSuffix
  = (!'+' httpTokenChar)+ {return text().toLowerCase()}

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
  = '"' content:(httpQuotedStringChar*) '"' {return content.join('')}

httpQuotedStringChar
  = ('\\' @'"') / (!'"' @.)

httpTokenChar
  = [a-z0-9!#$%&'*+\-.^_`|~]i

httpWhitespace
  = [ \t\r\n]
