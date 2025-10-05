package SymbolConstants is
   Sym_Eof        : constant :=  0; -- (EOF)
   Sym_Error      : constant :=  1; -- (Error)
   Sym_Whitespace : constant :=  2; -- Whitespace
   Sym_Minus      : constant :=  3; -- '-'
   Sym_Lparen     : constant :=  4; -- '('
   Sym_Rparen     : constant :=  5; -- ')'
   Sym_Times      : constant :=  6; -- '*'
   Sym_Div        : constant :=  7; -- '/'
   Sym_Plus       : constant :=  8; -- '+'
   Sym_Entero     : constant :=  9; -- entero
   Sym_Log        : constant := 10; -- Log
   Sym_Real       : constant := 11; -- real
   Sym_Seno       : constant := 12; -- Seno
   Sym_E          : constant := 13; -- <E>
   Sym_F          : constant := 14; -- <F>
   Sym_T          : constant := 15; -- <T>
end SymbolConstants;

package ProdConstants is
   Prod_E_Plus               : constant :=  0; -- <E> ::= <E> '+' <T>
   Prod_E_Minus              : constant :=  1; -- <E> ::= <E> '-' <T>
   Prod_E                    : constant :=  2; -- <E> ::= <T>
   Prod_T_Times              : constant :=  3; -- <T> ::= <T> '*' <F>
   Prod_T_Div                : constant :=  4; -- <T> ::= <T> '/' <F>
   Prod_T                    : constant :=  5; -- <T> ::= <F>
   Prod_F_Lparen_Rparen      : constant :=  6; -- <F> ::= '(' <E> ')'
   Prod_F_Entero             : constant :=  7; -- <F> ::= entero
   Prod_F_Real               : constant :=  8; -- <F> ::= real
   Prod_F_Seno_Lparen_Rparen : constant :=  9; -- <F> ::= Seno '(' <E> ')'
   Prod_F_Log_Lparen_Rparen  : constant := 10; -- <F> ::= Log '(' <E> ')'
end RuleConstants;
