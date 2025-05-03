#Requires AutoHotkey v2.0
#Warn ; Enable warnings to assist with detecting common errors.
#SingleInstance force

SendMode "Event"

title:="GameName"

while true
{
  if WinActive(title)
  {
    if GetKeyState("RButton")
    {
      MouseClick("L")
    }
  }
  Sleep 50
}
