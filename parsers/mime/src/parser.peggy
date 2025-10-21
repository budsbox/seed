main
  = $httpWhitespace* str:mimeTypeString $httpWhitespace* {return str}

mimeTypeString
  = essence:essence httpWhitespace* parameters:parameters {return [essence, parameters]}

essence
  = type:type essenceDelimiter subtype:subtype { return [type, subtype] }

type
  = $httpTokenChar+

subtype
  = (tree:tree subtypePrefixDelimiter {return tree})? subtypeName (subtypeSuffixDelimiter suffix:subtypeSuffix {return suffix})?

tree
  = $(httpTokenChar!plusSign!period)+

subtypePrefixDelimiter
  = period

subtypeName
  = $(!plusSign httpTokenChar)+

subtypeSuffixDelimiter
  = plusSign

subtypeSuffix
  = $(httpTokenChar!plusSign)+

essenceDelimiter
  = forwardSlash

parameters
  = parameter*

parameter
  = parameterPrefix
    name:parameterName
    value:((equalSign strippedValue:parameterValue {return strippedValue}) / $[^;]* { return null })
    {return [name, value]}

parameterPrefix
  = semicolon httpWhitespace*

parameterName
  = $[^=;]+

parameterValue
  = (@value:httpQuotedString [^;]*) / (@value:$parameterUnquotedValue+ $httpWhitespace*)

parameterUnquotedValue
  = (!httpWhitespace [^;])+ (httpWhitespace+ parameterUnquotedValue)?

httpQuotedString
  = quote value:($httpQuotedStringChar*) quote {return value}

httpQuotedStringChar
  = ('\\' char:'"' { return char }) / [^"]

httpTokenChar
  = httpTokenNonControlChar / period / plusSign

httpTokenNonControlChar
  = alphanum / [!#$%&'*+-.^_`|~]

alphanum = [a-z0-9]i

period = '.'

forwardSlash = '/'

plusSign = '+'

semicolon = ';'

quote = '"'

equalSign = '='

httpWhitespace
  = [ \t\r\n]
