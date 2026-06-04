export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { summary } = req.body;
  if (!summary) {
    return res.status(400).json({ error: 'No summary provided' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `다음은 내가 완료한 할 일 목록이에요. 친근하고 따뜻하게 분석해주세요:\n${summary}\n\n다음 형식으로 답해주세요:\n1. 칭찬 한마디 (1-2문장)\n2. 어떤 분야 일을 많이 완료했는지\n3. 생산성 패턴 분석\n4. 다음 목표 제안\n\n정원사가 식물을 돌보듯 따뜻하고 자연스러운 톤으로 답해주세요. 이모지 적절히 사용해주세요.`
          }]
        }]
      })
    });

    const data = await response.json();
    const result = data.candidates[0].content.parts[0].text;
    res.status(200).json({ result });

  } catch(err) {
    res.status(500).json({ error: '분석 중 오류가 발생했어요.' });
  }
}
