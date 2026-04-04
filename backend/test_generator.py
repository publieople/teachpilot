"""测试课件生成模块"""
from modules.generator_service import generator_service

print("=" * 50)
print("测试 1: PPT 生成")
print("=" * 50)

slides = [
    {
        'title': '什么是教学设计',
        'content': [
            '教学设计是教师根据教学目标规划教学活动的过程',
            '包括目标设定、内容选择、方法设计等环节',
            '目的是提高教学效果和学生学习体验'
        ],
        'notes': '重点强调教学设计的系统性'
    },
    {
        'title': '教学设计的要素',
        'content': [
            '教学目标：学生应该掌握什么',
            '教学内容：教什么知识点',
            '教学方法：如何教',
            '教学评价：如何评估学习效果'
        ]
    },
    {
        'title': '教学设计的原则',
        'content': '以学生为中心，注重实践应用，促进深度学习'
    }
]

ppt_path = generator_service.generate_ppt(
    title="教学设计基础",
    slides=slides,
    subtitle="教师培训系列课程"
)
print(f"PPT 生成成功：{ppt_path}")
print()

print("=" * 50)
print("测试 2: Word 教案生成")
print("=" * 50)

word_path = generator_service.generate_word_lesson_plan(
    title="教学设计基础",
    teaching_objectives="1. 理解教学设计的概念\n2. 掌握教学设计的要素\n3. 能够设计完整的教学方案",
    teaching_content="教学设计的定义、要素、原则和方法",
    teaching_methods="讲授法、案例分析法、小组讨论法",
    teaching_process=[
        {'stage': '导入（5 分钟）', 'content': '通过问题引入教学设计的概念'},
        {'stage': '讲解（20 分钟）', 'content': '讲解教学设计的要素和原则'},
        {'stage': '练习（15 分钟）', 'content': '分组设计教学方案'},
        {'stage': '总结（5 分钟）', 'content': '回顾本节课重点内容'}
    ],
    classroom_activities="小组讨论：设计一个完整的教学方案",
    homework="选择一个知识点，设计一份完整的教学设计"
)
print(f"Word 教案生成成功：{word_path}")
print()

print("=" * 50)
print("测试 3: HTML 动画生成")
print("=" * 50)

animation_path = generator_service.generate_html_animation(
    title="教学设计的重要性",
    content="教学设计是教学成功的关键。好的教学设计可以提高学生学习兴趣，提升教学效果，帮助教师更好地组织教学活动。",
    animation_type="fade"
)
print(f"HTML 动画生成成功：{animation_path}")
print()

print("=" * 50)
print("测试 4: 互动问答游戏生成")
print("=" * 50)

quiz_path = generator_service.generate_quiz_game(
    title="教学设计知识测试",
    questions=[
        {
            'question': '教学设计的首要环节是什么？',
            'options': ['A. 教学内容选择', 'B. 教学目标设定', 'C. 教学方法设计', 'D. 教学评价'],
            'answer': 1  # B
        },
        {
            'question': '以下哪项不属于教学设计的要素？',
            'options': ['A. 教学目标', 'B. 教学内容', 'C. 学生人数', 'D. 教学方法'],
            'answer': 2  # C
        },
        {
            'question': '教学设计应该以谁为中心？',
            'options': ['A. 教师', 'B. 学生', 'C. 教材', 'D. 校长'],
            'answer': 1  # B
        }
    ]
)
print(f"互动问答游戏生成成功：{quiz_path}")
print()

print("=" * 50)
print("[OK] 所有测试通过！")
print("=" * 50)
print(f"\n生成的文件位于：outputs/ 目录")
