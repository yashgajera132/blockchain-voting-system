from graphviz import Digraph

dot = Digraph()

dot.attr(rankdir='LR', size='10')

dot.node('A', 'User Registration & Authentication', shape='rect', style='filled', fillcolor='lightblue')
dot.node('B', 'AI Identity Verification', shape='rect', style='filled', fillcolor='lightgreen')
dot.node('C', 'Blockchain Integration', shape='rect', style='filled', fillcolor='yellow')
dot.node('D', 'Vote Casting & Storage', shape='rect', style='filled', fillcolor='orange')
dot.node('E', 'Results Display', shape='rect', style='filled', fillcolor='red')

dot.edges(['AB', 'BC', 'CD', 'DE'])

dot.render('blockchain_voting_flowchart', format='png', cleanup=False)
