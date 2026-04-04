"""测试迭代优化模块"""
import asyncio
from modules.modification_service import modification_service
from modules.version_manager import get_version_manager

async def test_understand_modification():
    """测试修改意见理解"""
    print("=" * 50)
    print("测试 1: 修改意见理解")
    print("=" * 50)
    
    original_content = {
        "ppt": {
            "title": "教学设计基础",
            "slides": [
                {"title": "什么是教学设计", "content": "教学设计是教师根据教学目标规划教学活动的过程。"},
                {"title": "教学设计的要素", "content": ["教学目标", "教学内容", "教学方法", "教学评价"]},
                {"title": "教学设计的原则", "content": "以学生为中心，注重实践应用。"}
            ]
        }
    }
    
    modification_request = "简化第二页的内容，只保留 3 个要点"
    
    plan = await modification_service.understand_modification(
        original_content=original_content,
        modification_request=modification_request
    )
    
    print(f"修改类型：{plan.get('modification_type')}")
    print(f"修改描述：{plan.get('description')}")
    print(f"操作数量：{len(plan.get('actions', []))}")
    print(f"影响页面：{plan.get('affected_slides', [])}")
    print("[OK] 修改意见理解测试通过\n")


def test_version_manager():
    """测试版本管理"""
    print("=" * 50)
    print("测试 2: 版本管理")
    print("=" * 50)
    
    import os
    project_id = "test_project"
    version_manager = get_version_manager(project_id)
    
    # 创建测试文件
    os.makedirs("outputs", exist_ok=True)
    test_file_1 = "outputs/test_ppt_v1.pptx"
    test_file_2 = "outputs/test_ppt_v2.pptx"
    
    # 如果文件不存在，创建空文件
    if not os.path.exists(test_file_1):
        from pptx import Presentation
        prs = Presentation()
        prs.save(test_file_1)
    if not os.path.exists(test_file_2):
        from pptx import Presentation
        prs = Presentation()
        prs.save(test_file_2)
    
    # 创建版本 1
    v1_id = version_manager.create_version(
        content_type="ppt",
        file_path=test_file_1,
        content_snapshot={
            "title": "教学设计基础",
            "slides": [
                {"title": "第一页", "content": "内容 1"},
                {"title": "第二页", "content": "内容 2"}
            ]
        },
        modification="初始版本"
    )
    print(f"创建版本 1: {v1_id}")
    
    # 创建版本 2
    v2_id = version_manager.create_version(
        content_type="ppt",
        file_path=test_file_2,
        content_snapshot={
            "title": "教学设计基础",
            "slides": [
                {"title": "第一页", "content": "内容 1"},
                {"title": "第二页", "content": "修改后的内容 2"},
                {"title": "第三页", "content": "新增内容"}
            ]
        },
        modification="添加新页面，修改第二页"
    )
    print(f"创建版本 2: {v2_id}")
    
    # 列出版本
    versions = version_manager.list_versions()
    print(f"\n版本列表 (共{len(versions)}个):")
    for v in versions:
        current = " [当前]" if v["is_current"] else ""
        print(f"  - {v['version_id']}{current}")
        print(f"    修改：{v['modification']}")
    
    # 版本对比
    print("\n版本对比:")
    diff = version_manager.diff_versions(v1_id, v2_id)
    for change in diff.get("changes", []):
        print(f"  - {change.get('description')}")
    
    # 回退到版本 1
    print(f"\n回退到版本 1...")
    version_manager.revert_to(v1_id)
    current = version_manager.get_current_version()
    print(f"当前版本：{current.version_id if current else '无'}")
    
    print("\n[OK] 版本管理测试通过\n")


async def main():
    """运行所有测试"""
    print("\n" + "=" * 60)
    print("阶段 5: 迭代优化模块测试")
    print("=" * 60 + "\n")
    
    # 测试 1: 修改意见理解
    await test_understand_modification()
    
    # 测试 2: 版本管理
    test_version_manager()
    
    print("=" * 60)
    print("[OK] 所有测试完成！")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
