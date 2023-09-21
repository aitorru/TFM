# Set the output
# Setup
Output build.gif
Set TypingSpeed 0.2
Set WindowBar Colorful
Set Margin 20
Set MarginFill "#6B50FF"

# Clear out any windows errors
Hide
Type "cls"
Enter
Show

# Set up a 1200x600 terminal with 46px font.
Set FontSize 26
Set Width 1200
Set Height 1200

Sleep 1s

Type "make test-ts-prod"

Sleep 500ms

Enter

Sleep 60s