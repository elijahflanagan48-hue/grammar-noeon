"""Reviewed targets for whole-sentence and choice exercises without blank metadata.

These describe the required answer, not the distractors or the incorrect prompt.
Use all tested tenses for translations and complete-sentence transformations.
"""
NAMES = dict(zip('ps pc pp ppc as ac ap apc fs fc fp fpc extra'.split(),
    'present_simple present_continuous present_perfect present_perfect_continuous past_simple past_continuous past_perfect past_perfect_continuous future_simple future_continuous future_perfect future_perfect_continuous other_constructions'.split()))
GROUPS = {
 'new-translation': 'ps;pc;pp;ppc;as;as ac;as ap;apc;pc fs;pc;ps;fp;fc;fpc;extra;fs ps;ps pp;pp as;pc;extra ps;ps pp;pp;as;ap as',
 'new-choice': 'ps;pc;as;pp;pp;ppc;ap;extra;ps;fc;fp;ps',
 'new-error': 'ps;as;fs ps;pp;fp;as ap;pp;pc;ac;pp;ap as;ps fs',
 'new-meaning': 'ps;pc;pp;ppc;ps;pc;fs;extra',
 'adv-translation': 'pp;ppc ps;as apc;as ap;extra as;extra as;fp;fc;ps fs;fpc;pc;pc ps;ap as;pp;ps pp;fp as',
 'adv-choice': 'pp;ppc;as;ac;pc;extra;fc;as ap;as;ps;pp;fp',
 'adv-transform': 'extra;extra as;ap as;pp;ppc;as apc;fp;fc;ps;pc;pp;fs ps',
 'adv-edit': 'pp;ps;ps;fpc;ap as;ap as;as;as;as extra;ps;fp;pp',
 'adv-discourse': 'as;ppc;as;extra;ps;fp',
}
TARGETS = {f'{prefix}-{index:03}': [NAMES[key] for key in keys.split()]
           for prefix, rows in GROUPS.items() for index, keys in enumerate(rows.split(';'), 1)}


def add_practice_targets(item):
    if item['id'] in TARGETS:
        item['practice_tenses'] = TARGETS[item['id']]
    return item
