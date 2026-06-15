from setuptools import setup, find_packages

setup(
    name="equalyze-sdk",
    version="0.2.0",
    description="Python SDK for Equalyze Platform CI/CD integration",
    author="Equalyze",
    package_dir={"": "src"},
    packages=find_packages(where="src"),
    install_requires=[
        "requests>=2.25.0",
        "pydantic>=2.0.0",
        "pandas>=1.0.0",
        "tenacity>=8.0.0"
    ],
)
