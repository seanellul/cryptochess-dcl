import { Dialog } from '@dcl/npc-scene-utils'

export const MonkDialog: Dialog[] = [
  // #0
  {
    text: "Hi, I'm RoVi - welcome to CryptoChess",
  },
  // #1
  {
    text: "Would you like to learn more about this place?",
    isQuestion: true,
    buttons: [
      { label: "Rules", goToDialog: 7 },
      { label: "About", goToDialog: 3 },
    ],
  },
  // #2
  {
    text: "Okay, I'll be around if you get curious!",
    isEndOfDialog: true,
    // triggeredByNext: () => monk.playAnimation('Goodbye', true, 2),
  },
  // #3
  {
    text: "You got into CryptoChess, created by the Verse Impact team. My developers made chess in the Cyberpunk style.",
  },
  // #4
  {
    text: "You can play as you want, or you can play according to the generally accepted rules. For this, we added a couple of basic rules, but otherwise, complete freedom!",
  },
  // #5
  {
    text: "Call your friends and enjoy. Br*rssFitiFuayR*sss**",
  },
  // #6
  {
    text: "Would you like to learn the rules?",
    isQuestion: true,
    buttons: [
      { label: "Yes", goToDialog: 7 },
      { label: "No", goToDialog: 2 },
    ],
  },
  // #7
  {
    text: "Ok, you need to walk in turn and cupture the opponent's pieces. You can also castle the king. To make you comfortable to play, my developers made elevators, they are on the both sides, just click on it.",
  },
  // #8
  {
    text: "To the left of the board there are buttons for undo / redo and restart the game",
  },
  // #9
  {
    text: "Call your friends and enjoy. Br*rssFitiFuayR*sss**",
  },
  // #10
  {
    text: "Would you like to learn what's going on here?",
    isQuestion: true,
    buttons: [
      { label: "Yes", goToDialog: 3 },
      { label: "No", goToDialog: 2 },
    ],
  },
]