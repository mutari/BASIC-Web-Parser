1 REM Arrays and Subroutines Example
2 REM This program demonstrates arrays and subroutines in BASIC

10 REM Define namespace for the program
20 NAMESPACE "ARRAYS_DEMO"

30 REM Array declaration and initialization
40 ARRAY NUMBERS[10]
50 FOR I = 0 TO 9
60 LET NUMBERS[I] = I * 2
70 NEXT I

80 REM Print array contents
90 PRINT "Array contents:"
100 GOSUB 1000
110 PRINT ""

120 REM Find maximum value in array
130 GOSUB 2000
140 PRINT "Maximum value in array: " + MAX_VALUE
150 PRINT ""

160 REM Calculate sum of array elements
170 GOSUB 3000
180 PRINT "Sum of array elements: " + ARRAY_SUM
190 PRINT "Average of array elements: " + (ARRAY_SUM / 10)

999 END

1000 REM Subroutine: Print array contents
1010 FOR I = 0 TO 9
1020 PRINT "NUMBERS[" + I + "] = " + NUMBERS[I]
1030 NEXT I
1040 RETURN

2000 REM Subroutine: Find maximum value in array
2010 LET MAX_VALUE = NUMBERS[0]
2020 FOR I = 1 TO 9
2030 IF NUMBERS[I] > MAX_VALUE THEN LET MAX_VALUE = NUMBERS[I]
2040 NEXT I
2050 RETURN

3000 REM Subroutine: Calculate sum of array elements
3010 LET ARRAY_SUM = 0
3020 FOR I = 0 TO 9
3030 LET ARRAY_SUM = ARRAY_SUM + NUMBERS[I]
3040 NEXT I
3050 RETURN