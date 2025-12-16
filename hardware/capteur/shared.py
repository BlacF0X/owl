data_timer = 6

def change_timer_state(state):
    global data_timer
    data_timer = state

def get_timer_state():
    global data_timer
    return data_timer