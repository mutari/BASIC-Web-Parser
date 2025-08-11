1 REM Control Flow Example
2 REM This program demonstrates loops and conditionals in BASIC

10 REM Conditional statements with IF-THEN-ELSE
20 LET X = 10
30 IF X > 5 THEN GOTO 50
40 PRINT "X is less than or equal to 5"
50 PRINT "X is greater than 5"

60 REM Another conditional example
70 LET Y = 3
80 IF Y > 5 THEN GOTO 100
90 PRINT "Y is less than or equal to 5"
100 PRINT "Continuing program..."

110 REM FOR loop example
120 PRINT "Counting from 1 to 5:"
130 FOR I = 1 TO 5
140 PRINT I
150 NEXT I

160 REM FOR loop with STEP
170 PRINT "Even numbers from 0 to 10:"
180 FOR J = 0 TO 10 STEP 2
190 PRINT J
200 NEXT J

210 REM Combining loops and conditionals
220 PRINT "Numbers from 1 to 10, marking multiples of 3:"
230 FOR K = 1 TO 10
240 IF K % 3 = 0 THEN GOTO 270
250 PRINT K
260 GOTO 280
270 PRINT K + " (multiple of 3)"
280 NEXT K

999 END