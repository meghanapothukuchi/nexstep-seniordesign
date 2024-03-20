import { useState } from 'react'
import scores from './data/scores_3d_array.json'
import './App.css';

const STATES = {
  "AL": 0,
  "AZ": 1,
  "AR": 2,
  "CA": 3,
  "CO": 4,
  "CT": 5,
  "DE": 6,
  "FL": 7,
  "GA": 8,
  "ID": 9,
  "IL": 10,
  "IN": 11,
  "IA": 12,
  "KS": 13,
  "KY": 14,
  "LA": 15,
  "ME": 16,
  "MD": 17,
  "MA": 18,
  "MI": 19,
  "MN": 20,
  "MS": 21,
  "MO": 22,
  "MT": 23,
  "NE": 24,
  "NV": 25,
  "NH": 26,
  "NJ": 27,
  "NM": 28,
  "NY": 29,
  "NC": 30,
  "ND": 31,
  "OH": 32,
  "OK": 33,
  "OR": 34,
  "PA": 35,
  "RI": 36,
  "SC": 37,
  "SD": 38,
  "TN": 39,
  "TX": 40,
  "UT": 41,
  "VT": 42,
  "VA": 43,
  "WA": 44,
  "WV": 45,
  "WI": 46,
  "WY": 47
}

const CARRIERS = {
  0: 'Averitt',
  1: 'Dohrn',
  2: 'Estes',
  3: 'FedEx',
  4: 'Saia',
  5: 'XPO',
  6: 'YRC',
}

const NUM_STATES = 48
const NUM_CARRIERS = 7
const NUM_PARAMS = 3

function App() {
  const [state, setState] = useState('')
  const [weight, setWeight] = useState(0.0)
  const [result, setResult] = useState('')

  const onStateChange = (e) => {
    setState(e.target.value);
  }

  const onWeightChange = (e) => {
    setWeight(e.target.value);
  }

  const onSubmit = () => {
    console.log('submit')
    let score = calculateScore(state.toUpperCase(), weight);
    setResult(score)
  }

  function calculateScore(state, weight) {
    const stateIdx = STATES[state];

    const accessorialsWeight = 1.0;
    const claimsWeight = 1.0;
    const freightCostWeight = 1.0;

    let res = {
      0: -1,
      1: -1,
      2: -1,
      3: -1,
      4: -1,
      5: -1,
      6: -1,
    }

    for (let carrier = 0; carrier < NUM_CARRIERS; carrier++) {
      const accessorialsScore = scores[stateIdx][carrier][0] === -1 ? 0 : scores[stateIdx][carrier][0];
      const claimsScore = scores[stateIdx][carrier][1] === -1 ? 0 : scores[stateIdx][carrier][1];
      const freightCostScore = scores[stateIdx][carrier][2];

      // Check for NaN freightCostScore
      if (freightCostScore !== -1.0) {
        const score = (accessorialsScore * accessorialsWeight) +
          (claimsScore * claimsWeight) +
          (freightCostScore * weight * freightCostWeight);

        res[carrier] = score;
      }
    }

    return res;
  }


  return (
    <div className="App">
      <input
        type='text'
        name='state'
        onChange={onStateChange}
        value={state}
      />
      <input
        type='number'
        step="0.0001"
        name='weight'
        onChange={onWeightChange}
        value={weight}
      />
      <button type='submit' disabled={state === '' || weight == 0} onClick={onSubmit}>
        Submit
      </button>
      {result !== '' && (
        <div>
          {Object.entries(result).map(([carrier, score]) => (
            <div key={carrier}>
              Carrier: {CARRIERS[carrier]}, {score === -1 ? 'No existing freight/lb cost data' : `Score: ${score}`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
