function randomReward() {
  return Math.floor(Math.random() * (3000 - 2000 + 1)) + 2000;
}

function randomTarget(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = function generateMissions() {

  return [

    {
      type: "catch",
      target: randomTarget(8, 15),
      progress: 0,
      reward: randomReward(),
      completed: false
    },

    {
      type: "rare",
      target: randomTarget(2, 5),
      progress: 0,
      reward: randomReward(),
      completed: false
    },

    {
      type: "open",
      target: randomTarget(3, 6),
      progress: 0,
      reward: randomReward(),
      completed: false
    },

    {
      type: "shiny",
      target: 1,
      progress: 0,
      reward: randomReward() + 1000, // shiny paga más
      completed: false
    }

  ];
};
