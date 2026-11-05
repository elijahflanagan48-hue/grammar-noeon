"""Two derived tense tasks that named the required answer form."""
VERSION = '2026-10-28.1'
TASKS = {
    'new-error-005': (
        'Какое предложение представляет завершение проекта как результат, уже достигнутый к будущей пятнице?',
        ['By Friday I will have finished the project.','At this time on Friday I will still be working on the project.','Last Friday I finished the project.'],
        'Will have finished представляет завершение как достигнутый к будущему сроку результат. Второй вариант описывает незавершённый процесс, третий — прошлое.'),
    'adv-transform-007': (
        'The team’s report looks back from next Friday at twelve interviews already completed by then. Which sentence expresses that viewpoint?',
        ['The team will have completed all twelve interviews by Friday.','The team will still be conducting the twelve interviews on Friday.','The team completed all twelve interviews last Friday.'],
        'Will have completed рассматривает полный результат из будущей точки. Продолжающаяся работа и завершение в прошлую пятницу не передают заданную перспективу.'),
}


def revise(item):
    if item['id'] not in TASKS:
        return False
    prompt, options, explanation = TASKS[item['id']]
    if item.get('content_version') == VERSION and item.get('prompt') == prompt:
        return False
    for field in ('blanks','accepted_answers','answer_text','accepted_option_indices'):
        item.pop(field,None)
    shift = 1 if item['id']=='new-error-005' else 2
    item.update(type='meaning_choice',prompt=prompt,options=options[shift:]+options[:shift],
                correct_option_index=(-shift)%3,answer=options[0],explanation_ru=explanation,content_version=VERSION)
    return True
