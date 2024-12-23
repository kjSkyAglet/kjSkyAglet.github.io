const cardImages = [];
for (let i = 1; i <= 36; i++) {
  cardImages.push(`cards/${i.toString().padStart(2, '0')}.png`);
}

let usedCards = [];

// 時間管理ファイル (time.log) を扱う関数
async function manageTimeFile() {
  try {
    // ファイルを読み込む
    const response = await fetch('time.log');
    const timeData = await response.text();

    // 2分以上前のデータは削除
    const lines = timeData.split('\n').filter(line => Date.now() - parseInt(line) < 120000);
    const newTimeData = lines.join('\n');

    // ファイルを書き込む
    await fetch('time.log', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: newTimeData
    });

    // 最新のアクセス時間を追加
    await fetch('time.log', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: Date.now() + '\n' 
    });

    // 最新のアクセス時間に基づいて配列をリセット
    const lastAccessTime = parseInt(lines[lines.length - 1]); // 最後のアクセス時間
    if (Date.now() - lastAccessTime >= 30000) {
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

