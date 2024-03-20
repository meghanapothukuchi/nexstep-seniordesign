import numpy as np
import json

STATES = {
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

CARRIERS = {
    0: 'Averitt',
    1: 'Dohrn',
    2: 'Estes',
    3: 'FedEx',
    4: 'Saia',
    5: 'XPO',
    6: 'YRC',
}

NUM_STATES = 48 # AL = 0, AR = 1, AZ = 2, ...
NUM_CARRIERS = 7 # Averitt = 0, Dohrn = 1, Estes = 2, ...
NUM_PARAMS = 3 # Accessorials = 0, Claims = 1, Freight = 2, ...

scores = np.loadtxt('output/scores_3d_array.txt').reshape((NUM_STATES, NUM_CARRIERS, NUM_PARAMS))

input_state = input("Enter a state abbreviation (not AK or HI): ").upper()
input_weight = float(input("Enter the weight (in pounds): "))
print()

# (score[AL][Dorhn][freight/lb] * weight of shipment * assigned weight) + (score[AL][Dorhn][accessorials]* assigned weight) + (score[AL][Dorhn][claims] * assigned weight)
def calculate_score(state, weight):
    state_idx = STATES[state]

    accessorials_weight = 1.0
    # claims_weight = 1.0
    freight_cost_weight = 1.0

    res = 'State: {}\t\tInput Weight: {}lbs\n'.format(state, weight)
    res += '==============================================\n'

    res_scores = []
    
    for carrier in range(NUM_CARRIERS):
        accessorials_score = 0 if scores[state_idx, carrier, 0] == -1 else scores[state_idx, carrier, 0]
        freight_cost_score = scores[state_idx, carrier, 2]

        # check for NaN freight_cost_score
        if freight_cost_score == -1.0:
            res_scores.append((carrier, -1))
        else:
            score = (accessorials_score * accessorials_weight) + (freight_cost_score * weight * freight_cost_weight)
            res_scores.append((carrier, score))

    res_scores.sort(key=lambda x: x[1])
    for carrier, score in res_scores:
        claims_score = 0 if scores[state_idx, carrier, 1] == -1 else scores[state_idx, carrier, 1]
        if score != -1:
            res += 'Carrier: {}\t\tScore: {}'.format(CARRIERS[carrier], score)
            if claims_score > 0:
                res += '\t\tWARNING: {} claims in the past.\n'.format(int(claims_score))
            else:
                res += '\n'
        else:
            res += 'Carrier: {}\t\tNo existing freight/lb cost data\n'.format(CARRIERS[carrier])
        
    
    return res

        
output = calculate_score(input_state, input_weight)
print(output)