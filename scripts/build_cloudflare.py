"""Build a strict public asset directory and the trusted checker from app.js."""
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'cloudflare'
PUBLIC = OUT / 'public'
GENERATED = OUT / 'generated'


def build():
    if PUBLIC.exists():
        shutil.rmtree(PUBLIC)
    PUBLIC.mkdir(exist_ok=True)
    GENERATED.mkdir(exist_ok=True)
    for name in ('sw.js', 'pwa.js', 'index.html', 'app.js', 'accounts.js', 'students-roster.js', 'students-roster.css', 'teacher-library.js', 'task-issues.js', 'notifications.js', 'practice-report.js', 'assessments.js', 'styles.css', 'passive.js', 'passive.css', 'modal-verbs.js', 'modal-verbs.css', 'reported-speech.js', 'nouns-rule.js', 'nouns-rule.css', 'speaking-verbs.js', 'speaking-verbs.css', 'tense-map.js', 'theory-ui.js', 'theory-ui.css', 'tense-canvas.js', 'tense-canvas.css', 'tense-map.css', 'home-design.js', 'home-design.css', 'theme-boot.js', 'wixt-lat.woff2', 'wixt-cyr.woff2', 'wixd-lat.woff2', 'wixd-cyr.woff2', 'favicon.svg', 'apple-touch-icon.png', 'manifest.webmanifest'):
        shutil.copy2(ROOT / name, PUBLIC / name)
    allowed = [*sorted((ROOT / 'icons').glob('*.png')), ROOT / 'icons/app-icon.svg', ROOT / 'data/theory.json', ROOT / 'data/exercises/index.json',
               *sorted((ROOT / 'data/exercises').glob('part-*.json')),
               *sorted((ROOT / 'content/theory').glob('*.md')), *sorted((ROOT / 'content/theory').glob('*.html')),
               *sorted((ROOT / 'content/theory').glob('reported-full.*'))]
    for file in allowed:
        destination = PUBLIC / file.relative_to(ROOT)
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(file, destination)
    source = (ROOT / 'app.js').read_text()
    (GENERATED / 'assignment-keys.mjs').write_text(source[source.index('function assignmentSentenceKeys('):source.index('\nfunction uniqueAssignmentPool(')] + '\nexport { assignmentSentenceKeys };\n')
    selection = source[source.index('const TENSE_MAP ='):source.index('const account =')] + source[source.index('const COMPARISON_TARGETS ='):source.index('function practiceSettings(')]
    (GENERATED / 'selection.mjs').write_text(selection + '\nexport { balancedPractice, exerciseTenses, PRACTICE_TENSES, exerciseSection, targetSection, supportedResponseContract };\n')
    normalise = source[source.index('const normalise ='):source.index('\nfunction inlineMarkdown')]
    accepted = source[source.index('function acceptedFor('):source.index('\nfunction answerControls(')]
    checker = source[source.index('function answerForms('):source.index('\nfunction renderSession(')]
    (GENERATED / 'checker.mjs').write_text(normalise + '\n' + accepted + '\n' + checker + '''
export function grade(item, submitted) {
  if(item.options) {
    if(!Number.isInteger(submitted)||submitted<0||submitted>=item.options.length)throw new Error('Выберите ответ.');
  } else {
    const values=Array.isArray(submitted)?submitted:[submitted];
    if(values.length!==(item.blanks?.length||1)||values.some(v=>typeof v!=='string'||!v.trim()||v.length>10000))throw new Error('Заполните все поля.');
  }
  const fields=fieldResults(item,submitted);
  return {id:item.id,submitted,correct:fields.every(f=>f.correct),fields,item,checker:3};
}
''')
    report = (ROOT / 'practice-report.js').read_text()
    topics = report[report.index('function reportFieldTopics('):report.index('function reportSummary(')]
    (GENERATED / 'topics.mjs').write_text("import { exerciseTenses } from './selection.mjs';\n" + topics + '\nexport { reportFieldTopics, storedTopicSummary, reviewableTranslationField };\n')
    bank = [item for file in sorted((ROOT / 'data/exercises').glob('part-*.json'))
            for item in json.loads(file.read_text())]
    (GENERATED / 'bank.json').write_text(json.dumps(bank, ensure_ascii=False))
    assessment_source=(ROOT/'assessments.js').read_text()
    config=assessment_source[assessment_source.index('const ASSESSMENT_SECTIONS ='):assessment_source.index('let disposeAssessment =')]
    (GENERATED/'assessment-config.mjs').write_text(config+'\nexport { ASSESSMENT_SECTIONS, assessmentSection, assessmentTitle };\n')
    assessments=[]
    for section in ('comparison','tenses','passive'):
        assessments.extend(json.loads((ROOT / f'content/assessments/{section}.json').read_text()))
    (GENERATED/'assessments.json').write_text(json.dumps(assessments,ensure_ascii=False))
    shutil.copy2(ROOT / '_headers', PUBLIC / '_headers')
    print(f'Cloudflare: {len(bank)} exercises; public files copied by allowlist.')


if __name__ == '__main__':
    build()
