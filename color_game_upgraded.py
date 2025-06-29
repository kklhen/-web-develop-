import random
import time

def generate_item(colors, shapes, patterns):
    """生成一个随机的物品，包含颜色、形状和图案属性。"""
    color = random.choice(colors)
    shape = random.choice(shapes)
    pattern = random.choice(patterns)
    return {"color": color, "shape": shape, "pattern": pattern}

def get_item_description(item, colorblind_mode=False, option_index=None, detail_level='full'):
    """
    根据模式返回物品的用户友好描述。
    colorblind_mode: 是否为色盲模式。
    option_index: 如果是选项列表中的一项，则为其编号 (0-indexed)。
    detail_level: 'full' (颜色、形状、图案), 'shape_pattern' (形状、图案), 'shape_only' (仅形状)。
    """
    desc_parts = []
    if not colorblind_mode:
        desc_parts.append(item['color'])
        desc_parts.append(item['pattern'])
        desc_parts.append(item['shape'])
        base_description = f"一个 {item['color']}的 {item['pattern']}{item['shape']}"
    else:
        # 色盲模式下，主要信息是形状和图案，颜色作为次要或提示信息
        if option_index is not None:
            # 选项列表：强调编号、形状和图案，括号内提供颜色
            base_description = f"编号 {option_index + 1}: 一个 {item['pattern']}{item['shape']} (原始颜色: {item['color']})"
        else:
            # 目标物品：强调形状和图案
            base_description = f"一个 {item['pattern']}{item['shape']}"
    
    return base_description

def get_player_choice(max_options):
    """获取并验证玩家的数字输入。"""
    while True:
        try:
            choice = int(input(f"请输入您的选择 (1-{max_options}): "))
            if 1 <= choice <= max_options:
                return choice - 1  # 转换为0-索引
            else:
                print(f"无效输入，请输入 1 到 {max_options} 之间的数字。")
        except ValueError:
            print("无效输入，请输入一个数字。")

def select_difficulty():
    """让玩家选择游戏难度。"""
    print("\n请选择游戏难度：")
    print("  1. 简单 (3 轮, 每轮 2 个选项)")
    print("  2. 中等 (5 轮, 每轮 3 个选项)")
    print("  3. 困难 (7 轮, 每轮 4 个选项)")
    while True:
        try:
            choice = int(input("请输入难度编号 (1-3): "))
            if choice == 1:
                return {"rounds": 3, "options": 2, "name": "简单"}
            elif choice == 2:
                return {"rounds": 5, "options": 3, "name": "中等"}
            elif choice == 3:
                return {"rounds": 7, "options": 4, "name": "困难"}
            else:
                print("无效输入，请输入 1, 2, 或 3.")
        except ValueError:
            print("无效输入，请输入一个数字。")

def play_game():
    print("欢迎来到升级版·色盲友好识别游戏！")
    print("----------------------------------")

    # 询问玩家是否开启色盲模式
    while True:
        mode_choice = input("您是否需要开启色盲辅助模式？（这将调整显示方式以提供更多形状/图案/编号提示）[是/否]: ").lower()
        if mode_choice in ['是', 'y', 'yes']:
            colorblind_mode = True
            print("已开启色盲辅助模式。游戏将优先强调形状、图案和编号。")
            break
        elif mode_choice in ['否', 'n', 'no']:
            colorblind_mode = False
            print("已关闭色盲辅助模式。游戏将正常描述颜色、形状和图案。")
            break
        else:
            print("无效输入，请输入 '是' 或 '否'。")
    
    time.sleep(1)

    # 选择难度
    difficulty = select_difficulty()
    num_rounds = difficulty["rounds"]
    num_options_per_round = difficulty["options"]
    print(f"难度已设置为：{difficulty['name']}")
    time.sleep(1)

    # 游戏设置
    colors = ["红色", "蓝色", "绿色", "黄色", "紫色", "橙色", "青色", "粉色"]
    shapes = ["圆形", "正方形", "三角形", "星形", "心形", "菱形", "五边形", "六边形"]
    patterns = ["实心", "条纹", "波点", "网格", "棋盘格"]
    
    score = 0

    for round_num in range(1, num_rounds + 1):
        print(f"\n--- 第 {round_num} / {num_rounds} 轮 ({difficulty['name']}) ---")

        # 生成目标物品
        target_item = generate_item(colors, shapes, patterns)

        # 生成选项列表 (确保目标物品在其中，且选项不重复)
        options = [target_item]
        while len(options) < num_options_per_round:
            new_option = generate_item(colors, shapes, patterns)
            if new_option not in options: # 字典比较的是内容
                options.append(new_option)
        
        random.shuffle(options)  # 打乱选项顺序

        # 描述目标物品
        target_description = get_item_description(target_item, colorblind_mode)
        print(f"请找出：{target_description}")
        time.sleep(0.5)

        # 显示可供选择的物品
        print("\n可供选择的物品：")
        for i, item in enumerate(options):
            desc = get_item_description(item, colorblind_mode, option_index=i)
            print(f"  {i+1}. {desc}")

        if colorblind_mode:
            print("\n提示：在色盲模式下，主要通过形状、图案和选项编号来区分。括号内的颜色描述仅供参考。")

        player_choice_idx = get_player_choice(num_options_per_round)
        player_chosen_item = options[player_choice_idx]

        # 获取玩家选择的物品的描述，移除编号前缀（如果存在）
        chosen_desc_full = get_item_description(player_chosen_item, colorblind_mode, option_index=player_choice_idx)
        chosen_desc_natural = chosen_desc_full.replace(f"编号 {player_choice_idx + 1}: ", "")
        print(f"您选择了：{chosen_desc_natural}")

        if player_chosen_item == target_item:
            print("恭喜！您找到了正确的物品！")
            score += 1
        else:
            print("很遗憾，您选择了错误的物品。")
            # 无论是否色盲模式，都给出完整的正确答案描述（非色盲模式下的描述）
            correct_answer_desc = get_item_description(target_item, colorblind_mode=False)
            print(f"正确的物品是：{correct_answer_desc}")

        time.sleep(2) # 暂停，让玩家看清结果

    print("\n--- 游戏结束 ---")
    print(f"您的最终得分是：{score} / {num_rounds} (难度: {difficulty['name']})")
    if score == num_rounds:
        print("太棒了！完美通关！")
    elif score >= num_rounds * 0.6:
        print("表现不错！")
    else:
        print("再接再厉！")
    print("感谢您的游玩！")

# 运行游戏
if __name__ == "__main__":
    play_game()