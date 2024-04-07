import numpy as np
import pandas as pd
import json

NUM_STATES = 48 # AL = 0, AR = 1, AZ = 2, ...
NUM_CARRIERS = 7 # Averitt = 0, Dohrn = 1, Estes = 2, ...
NUM_PARAMS = 4 # Accessorials = 0, Claims = 1, Freight = 2, ...

# params dfs
accessorials_df = pd.read_csv('./assets/Accessorials.csv')
claims_df = pd.read_csv('./assets/Claims.csv')
freight_cost_df = pd.read_csv('./assets/Freight_per_lb.csv')
transit_time_df = pd.read_csv('./assets/transit_time.csv')
customer_pref_df = pd.read_csv('./assets/customerpref.csv')

# print(accessorials_df.shape)
# print(claims_df.shape)
# print(freight_cost_df.shape)
# print(transit_time_df.shape)

def get_val(state_idx, carrier_idx, param_idx):
    val = -1.0
    if param_idx == 0:
        val = accessorials_df.iat[state_idx, carrier_idx]
    elif param_idx == 1:
        val = claims_df.iat[state_idx, carrier_idx]
    elif param_idx == 2:
        val = freight_cost_df.iat[state_idx, carrier_idx]
    elif param_idx == 3:
        val = transit_time_df.iat[state_idx, carrier_idx]
    
    return -1 if np.isnan(val) else val

# load scores from dataframes
scores = np.full((NUM_STATES, NUM_CARRIERS, NUM_PARAMS), fill_value = -1.0, dtype = float)
for i in range(NUM_STATES):
    for j in range(0, NUM_CARRIERS):
        for k in range(NUM_PARAMS):
             score = get_val(i, j + 1, k)
             scores[i, j, k] = score

# write 3D array to file
# splits into NUM_STATES slices due to dimensional constraints, but will be read back fine
# load function: numpy.loadtxt('scores_3d_array.txt').reshape((48, 7, 4))
with open('output/scores_3d_array.txt', 'w') as output_file:
    output_file.write('# 3D Shape: {0}\n'.format(scores.shape))
    for i, slice in enumerate(scores):
        output_file.write('# {}:\n'.format(accessorials_df.iat[i, 0]))
        np.savetxt(output_file, slice, fmt='%-7.4f')

scores_list = scores.tolist()
with open('frontend/src/data/scores_3d_array.json', 'w') as output_file:
    json.dump(scores_list, output_file)

customer_pref_df.to_json('frontend/src/data/customer_pref.json', orient='records')
