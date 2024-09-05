const cardImages = [];
for (let i = 1; i <= 36; i++) {
  cardImages.push(`cards/${i.toString().padStart(2, '0')}.png`);
}

let usedCards = [];

// 時間管理ファイル (time.json) を扱う関数
async function manageTimeFile() {
  try {
    // ファイルを読み込む
    const response = await fetch('time.json');
    const timeData = await response.json();

    // 2分以上前のデータは削除
    timeData.accessTimes = timeData.accessTimes.filter(time => Date.now() - time < 120000);

    // 最新のアクセス時間を追加
    timeData.accessTimes.push(Date.now());

    // ファイルを書き込む
    await fetch('time.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(timeData)
    });

    // 最新のアクセス時間に基づいて配列をリセット
    if (Date.now() - timeData.accessTimes[timeData.accessTimes.length - 1] >= 30000) {
      usedCards = [];
    }

  } catch (error) {
    console.error('時間管理ファイルの処理中にエラーが発生しました:', error);
  }
}

// 使用済みカードファイル (usedCards.json) を扱う関数
async function loadUsedCards() {
  try {
    const response = await fetch('usedCards.json');
    usedCards = await response.json();
  } catch (error) {
    console.error('使用済みカードファイルの読み込みに失敗しました:', error);
  }
}

async function saveUsedCards() {
  try {
    await fetch('usedCards.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(usedCards)
    });
  } catch (error) {
    console.error('使用済みカードファイルの保存に失敗しました:', error);
  }
}

function getRandomCard() {
  // 既に使用したカードを除外して選択
  const remainingCards = cardImages.filter(card => !usedCards.includes(card));
  if (remainingCards.length === 0) {
    // 全てのカードが使用済みになったら、再度全てから選択
    usedCards = [];
  }
  const randomIndex = Math.floor(Math.random() * remainingCards.length);
  const card = remainingCards[randomIndex];
  usedCards.push(card);
  return card;
}

// 初回ロード時はランダムなカードを表示
document.addEventListener('DOMContentLoaded', async () => {
  await manageTimeFile(); // 時間管理ファイルの処理
  await loadUsedCards(); // 使用済みカードファイルを読み込む
  const cardImage = document.getElementById('cardImage');
  cardImage.src = getRandomCard();
  await saveUsedCards(); // 使用済みカードファイルを保存
});

