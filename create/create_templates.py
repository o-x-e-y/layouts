import json
import re
from typing import Tuple


ROOT = "C:/Users/lucoe/PycharmProjects/layouts"


class Layout:
    def __init__(self, name, language):
        self.name = name
        self.language = language


def load_char_stats():
    with open('create/char_stats.json', 'r', encoding='utf-8') as file:
        return json.load(file)


def load_layout_keys(formatted_name: str):
    with open(f'{formatted_name}/layout.kb', 'r', encoding='utf-8') as file:
        return "".join(file.read().split())


def get_key_info(char: str, freq_map: dict[float]) -> Tuple[str, str]:
    prevalence = freq_map[char]
    complement = 190 - prevalence * 1750
    if complement < 0:
        complement = 0
    rgb = f"rgb(175, {round(complement)}, {round(complement)})"
    title = f"Key usage: {round(prevalence*100, ndigits=2)}%"
    return rgb, title


def build_keyboard(language: str, formatted_name: str) -> str:
    chars = load_layout_keys(formatted_name)
    char_stats = load_char_stats()[language]
    keys = []
    for i, char in enumerate(chars):
        rgb, title = get_key_info(char, char_stats)
        key = f'<div class="k" style="background-color: {rgb};" title="{title}">{char}</div>'
        keys.append(key)
        if i in [4, 14, 24]:
            keys.append('<div class="empty"></div>')
    return "\n\t\t\t\t".join(keys)


def get_contents(formatted_name: str) -> str:
    with open(f"{formatted_name}/text.md", 'r', encoding='utf-8') as file:
        return file.read()


def text_to_section(text: str) -> str:
    n = "\n"
    r = "\n\t\t\t\t"
    description_paragraphs = [
        f'\t\t\t<p>{r}{r.join(section.split(n))}\n\t\t\t</p>' for section in text.split("\n\n")
    ]
    return "\n".join(description_paragraphs)


def parse_contents(formatted_name: str) -> Tuple[str, str]:
    text = get_contents(formatted_name)
    text = re.sub(r"\*{2}([^\s*]+)\*{2}", r"<b>\1</b>", text)
    text = re.sub(r"\*([^\s*]+)\*", r"<i>\1</i>", text)
    text = re.sub(r"__([^\s_]+)__", r"<b>\1</b>", text)
    text = re.sub(r"_([^\s_]+)_", r"<i>\1</i>", text)
    text = re.sub(r"~~([^\s~]+)~~", r"<s>\1</s>", text)
    text = re.sub(r"`([^\s_]+)`", r"<code>\1</code>", text)
    text.replace(r"\*", "*").replace(r"\_", "_").replace(r"\~", "~").replace(r"\`", "`")

    sections = text.split("\n\n\n")
    description, thoughts = sections[0], sections[1]

    return text_to_section(description), text_to_section(thoughts)


def get_stats(formatted_name: str) -> str:
    with open(f'{formatted_name}/stats.txt', 'r', encoding='utf-8') as file:
        stats = file.read()
        res = stats.replace("\n\n", "<br><br>\n\n").replace("%\n", "%<br>\n")
        res = re.sub(r"Sfb:\s*", "Sfb: &nbsp;", res)
        res = re.sub(r"Lsb:\s*", "Lsb: &nbsp;", res)

        return "\n\t\t\t\t".join(res.split("\n"))


def create_template(layout_name: str, language: str, call_index=False):
    """
    NOTE THAT PUTTING BOTH put_in_folder AND call_index TO True will OVERWRITE THE CURRENT VERSION OF THE
    FILE THAT'S THERE

    :param layout_name: the name of the layout it should create a template for
    :param language: the lanugage the layout is made for
    :param call_index: whether to name the file index.html
    :return:
    """

    formatted_name = layout_name.lower().replace(" ", "_")
    description, thoughts = parse_contents(formatted_name)

    template = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{layout_name}</title>
    <link rel="stylesheet" href="../styles.css">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300&display=swap" rel="stylesheet">
</head>
<body style="background-color: #222;">
    <div id="home-wrapper">
        <div id="home">Home</div>
        <a href="../index.html"><span id="home-link"></span></a>
    </div>
    <header>
        <h1>{layout_name}</h1>
    </header>
    <article>
        <div class="kb-wrapper">
            <div id="keyboard">
                {build_keyboard(language.lower(), formatted_name)}
            </div>
        </div>
        <h2>Description</h2>
        <section>
{description}
        </section>
        <h2>Thoughts</h2>
        <section>
{thoughts}
        </section>
        <h2>Analyzer stats</h2>
        <div id="stats-wrapper">
            <div class="stats">
                {get_stats(formatted_name)}
            </div>
        </div>
    </article>
</body>
</html>
    """.replace("    ", "\t")

    file_name = "index.html" if call_index else f'{formatted_name}_template.html'
    path = f"{ROOT}/{formatted_name}/{file_name}"
    print(f"'{layout_name}' has been updated")
    with open(path, 'w+', encoding='utf-8') as file:
        file.write(template)


def to_update() -> list[Tuple[str, str]]:
    with open("create/to_update.txt", 'r', encoding='utf-8') as file:
        lines = file.read().split('\n')
        res = []
        for line in lines:
            thing = line.split('-')
            name, language = thing[0].strip(), thing[1].strip()
            res.append((name, language.lower()))
        return res


def create_templates(): 
    for name, language in to_update():
        create_template(name, language, True)


def main():
    create_templates()


if __name__ == "__main__":
    main()
