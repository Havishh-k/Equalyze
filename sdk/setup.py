from setuptools import setup, find_packages

setup(
    name="equalyze-sdk",
    version="0.1.0",
    description="Python SDK for Equalyze Platform CI/CD integration",
    author="Equalyze",
    py_modules=["equalyze"],
    install_requires=[
        "requests>=2.25.0",
    ],
    entry_points={
        "console_scripts": [
            "equalyze-audit-gate=equalyze:run_cicd_gate",
        ],
    },
)
