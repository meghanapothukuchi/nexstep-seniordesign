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

// const NUM_STATES = 48
const NUM_CARRIERS = 7
// const NUM_PARAMS = 3

function toFixed(num, fixed) {
  var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
  return num.toString().match(re)[0];
}

function customSort(a, b) {
  if (a.score === -1 && b.score !== -1) {
    return 1;
  } else if (a.score !== -1 && b.score === -1) {
    return -1;
  } else {
    return a.score - b.score;
  }
}

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
    let score = calculateScore(state.toUpperCase(), weight);
    setResult(score)
  }

  const onClear = () => {
    setState('');
    setWeight(0.0);
    setResult('')
  }

  function calculateScore(state, weight) {
    const stateIdx = STATES[state];

    let res = {
      0: {
        score: -1,
        warnings: []
      },
      1: {
        score: -1,
        warnings: []
      },
      2: {
        score: -1,
        warnings: []
      },
      3: {
        score: -1,
        warnings: []
      },
      4: {
        score: -1,
        warnings: []
      },
      5: {
        score: -1,
        warnings: []
      },
      6: {
        score: -1,
        warnings: []
      },
    }

    for (let carrier = 0; carrier < NUM_CARRIERS; carrier++) {
      const accessorialsScore = scores[stateIdx][carrier][0] === -1 ? 0 : scores[stateIdx][carrier][0];
      // const claimsScore = scores[stateIdx][carrier][1] === -1 ? 0 : scores[stateIdx][carrier][1];
      const freightCostScore = scores[stateIdx][carrier][2];

      // Check for NaN freightCostScore
      if (freightCostScore !== -1.0) {
        const s = (accessorialsScore) + (freightCostScore * weight);
        res[carrier].score = s;
      }
    }

    Object.entries(res).map(([carrier, data]) => {
      const claimsScore = scores[stateIdx][carrier][1] === -1 ? 0 : scores[stateIdx][carrier][1];
      const transit_time_score = scores[stateIdx][carrier][3] === -1 ? 0 : scores[stateIdx][carrier][3];

      if (data.score !== -1) {
        if (claimsScore > 0) {
          data.warnings.push(`${Math.floor(claimsScore)} claim(s) in the past`)
        }

        if (transit_time_score < 85) {
          data.warnings.push(`Historically late deliveries.`)
        }
      }
    })

    // Sorts res by increasing score
    const resArray = Object.entries(res).map(([index, value]) => ({ carrier: CARRIERS[index], ...value }));
    resArray.sort(customSort);
    const sortedRes = {};
    resArray.forEach((obj, index) => {
      sortedRes[index] = obj;
    });

    return sortedRes;
  }


  return (
    <div>
      <div className="container">
        <div className="input-group mb-3">
          <span
            className="input-group-text"
            id="inputGroup-sizing-default"
          >
            State Abbr. (not AL or HI)
          </span>
          <input
            type="text"
            name="state"
            className="form-control"
            onChange={onStateChange}
            value={state}
            aria-label="Sizing example input"
            aria-describedby="inputGroup-sizing-default" />
        </div>
        <div className="input-group mb-3">
          <span
            className="input-group-text"
            id="inputGroup-sizing-default"
          >
            Weight (lbs)
          </span>
          <input
            type="number"
            name="weight"
            step="0.0001"
            className="form-control"
            onChange={onWeightChange}
            value={weight}
            aria-label="Sizing example input"
            aria-describedby="inputGroup-sizing-default" />
        </div>
        <div className='rowCustom'>
          <button type="button" className="btn btn-primary custom-btn" disabled={state === '' || weight === 0} onClick={onSubmit}>
            Submit
          </button>
          <button type="button" className="btn btn-danger custom-btn" disabled={state === '' && weight === 0} onClick={onClear}>
            Clear
          </button>
        </div>
      </div>
      {result !== '' && (
        <div className='table-container'>
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Carrier</th>
                <th scope="col">Score</th>
                <th scope="col">Warnings</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(result).map(([idx, data]) => (
                <tr key={idx}>
                  <th scope="row">{idx}</th>
                  <td>{data.carrier}</td>
                  <td>{data.score === -1 ? 'No existing freight/lb cost data' : `${toFixed(data.score, 3)}`}</td>
                  <td>
                    {data.warnings.length > 0 ? data.warnings.join(", ") : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

export default App;
