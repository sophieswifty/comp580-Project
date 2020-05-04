  # SpaceBug Math
  ## Final Report - Seth Yook, Sophie Swift, and Sofia Dimos
  
  We have created a product that serves as an educational and fun math game for children called Space Bug Math. It implements a speech to text function which can be used, as well as the arrow keys, to move your pawns across the board. The goal of the game is to solve the math problem presented, select the Trooper that is associated with the correct answer, and use them to kill the Space Bug. All of the troopers, as well as a freeze element which freezes the monster for two moves, should be used to corner the space bug. It’s important that the correct Trooper is the one to kill the bug; the other Troopers will result in a fail.


  This game was created for children in elementary school, to help them learn basic arithmetic. We are specifically hoping to target children with motor impairments, as there is no need to touch the computer to play the game. We did not want to incorporate a time element to make it easier for all children, so instead the game keeps track of the number of steps the player takes, making an additional goal to have as little steps as possible, which can make it slightly competitive. 


  As far as technologies go, this game was written in TypeScript and made use of HTML 5 in order to run successfully on Google Chrome. It makes use of a speech to text API, which players can use to move the Troopers across the board, activate the freeze element, and reset the game. There are a variety of image elements, as well as special effects, which create a stimulating experience for the players as well as the futuristic desired effect. 


  This game is a web-app, and in order to make this easier to build with three group members, we actively made use of GitHub. Apart from this, in Visual Studio code, we each used our own Local Ports to test the current code and debug individually, so that our product would improve each time someone pushed the changes onto GitHub. It is deployable with the link we have provided and needs to be played on Google Chrome. The microphone is an important tool in order to use the speech to text element.


  Our group ran into issues with adapting the template code that we found, which did not use any data structures. As we moved through the process, we found ourselves having to implement our own, new arrays in order to successfully do what we wanted. In a similar sense, we had to create, implement, and randomize a list of equations. This was something that we struggled with but eventually were able to successfully implement. By randomizing the two variables in question we can have a different math problem everytime they refresh the page, making the game replay-able and new.
  
  In terms of future work, we would likely move towards adding narration or additional sound effects to indicate to visually impaired people where they are on the board, how close they are to the Space Bug, and the like. In addition, we would like to see a randomized operator functions, that can extend past addition. 


  Overall, we are very proud of the product we have created and genuinely hope that children find as much joy in playing Space Bug Math as we did building, testing, and completing it. 
